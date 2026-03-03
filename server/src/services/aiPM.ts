/**
 * AI PM Service — Core intelligence engine for the AI Project Manager.
 *
 * Automates operational/analytical tasks:
 * - Health monitoring & risk detection
 * - Budget burn analysis
 * - Timeline management
 * - Status report generation
 * - Phase action recommendations
 *
 * Follows the same pattern as services/ai.ts:
 * Mock fallback when no API key, Anthropic SDK for real calls,
 * JSON parse with markdown fence stripping, operation logging.
 */
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../config/database.js';
import { config } from '../config/index.js';
import {
  InsightType,
  InsightSeverity,
  InsightStatus,
} from '../types/index.js';
import { notifyAndLog, getProjectStakeholders } from './notifications.js';

// ─── Anthropic Client ────────────────────────────────────

const anthropic = config.anthropic.apiKey
  ? new Anthropic({ apiKey: config.anthropic.apiKey })
  : null;

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

// ─── Types ───────────────────────────────────────────────

export interface AIPMInsight {
  id?: string;
  project_id: string;
  insight_type: InsightType;
  severity: InsightSeverity;
  title: string;
  summary: string;
  details: Record<string, unknown>;
  recommendations: string[];
  status: InsightStatus;
}

export interface StatusReport {
  executive_summary: string;
  phase_status: Array<{
    name: string;
    status: string;
    days_in_status: number;
    notes: string;
  }>;
  budget_summary: {
    total_cents: number;
    spent_cents: number;
    percent_used: number;
    burn_rate_per_day: number;
    projected_total: number;
    assessment: string;
  };
  risks: Array<{ title: string; severity: string; mitigation: string }>;
  next_steps: string[];
  overall_health: string;
}

export interface BudgetAnalysis {
  burn_rate_per_day_cents: number;
  projected_total_cents: number;
  runway_days: number;
  percent_used: number;
  status: 'healthy' | 'warning' | 'critical' | 'over_budget';
  recommendations: string[];
  optimization_opportunities: string[];
}

export interface PhaseRecommendation {
  phase_name: string;
  phase_id: string;
  action: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
}

// ─── Project Snapshot Builder ────────────────────────────

interface ProjectSnapshot {
  project: any;
  phases: any[];
  deliverables_by_phase: Record<string, any[]>;
  tasks_by_phase: Record<string, { total: number; completed: number; overdue: number }>;
  budget: { total_cents: number; spent_cents: number; percent_used: number };
  change_orders: any[];
  days_elapsed: number;
  days_remaining: number | null;
}

async function buildProjectSnapshot(projectId: string): Promise<ProjectSnapshot | null> {
  const project = await db('projects').where({ id: projectId }).first();
  if (!project) return null;

  const phases = await db('project_phases')
    .where({ project_id: projectId })
    .orderBy('sort_order');

  // Gather deliverables grouped by phase
  const deliverablesByPhase: Record<string, any[]> = {};
  for (const phase of phases) {
    const deliverables = await db('deliverables')
      .where({ phase_id: phase.id })
      .orderBy('revision_number', 'desc');
    deliverablesByPhase[phase.id] = deliverables;
  }

  // Gather task counts grouped by phase
  const tasksByPhase: Record<string, { total: number; completed: number; overdue: number }> = {};
  for (const phase of phases) {
    const tasks = await db('tasks').where({ phase_id: phase.id });
    const completed = tasks.filter((t: any) => t.is_complete).length;
    const overdue = tasks.filter(
      (t: any) => !t.is_complete && t.due_date && new Date(t.due_date) < new Date(),
    ).length;
    tasksByPhase[phase.id] = { total: tasks.length, completed, overdue };
  }

  // Change orders
  const changeOrders = await db('change_orders')
    .where({ project_id: projectId })
    .orderBy('created_at', 'desc')
    .limit(10)
    .catch(() => []);

  // Timeline calc
  const startDate = project.started_at ? new Date(project.started_at) : new Date(project.created_at);
  const daysElapsed = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = project.due_date
    ? Math.ceil((new Date(project.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const budgetCents = Number(project.budget_cents) || 0;
  const spentCents = Number(project.spent_cents) || 0;

  return {
    project,
    phases,
    deliverables_by_phase: deliverablesByPhase,
    tasks_by_phase: tasksByPhase,
    budget: {
      total_cents: budgetCents,
      spent_cents: spentCents,
      percent_used: budgetCents > 0 ? Math.round((spentCents / budgetCents) * 100) : 0,
    },
    change_orders: changeOrders,
    days_elapsed: daysElapsed,
    days_remaining: daysRemaining,
  };
}

/**
 * Convert snapshot to a compact text summary for prompts.
 * Truncates brief to 500 chars to manage token costs.
 */
function snapshotToPromptText(snap: ProjectSnapshot): string {
  const p = snap.project;
  const brief = (p.brief || '').substring(0, 500);
  const budgetStr = `$${(snap.budget.total_cents / 100).toLocaleString()}`;
  const spentStr = `$${(snap.budget.spent_cents / 100).toLocaleString()}`;

  const phaseLines = snap.phases.map((ph: any) => {
    const tasks = snap.tasks_by_phase[ph.id] || { total: 0, completed: 0, overdue: 0 };
    const deliverables = snap.deliverables_by_phase[ph.id] || [];
    const daysInStatus = ph.activated_at
      ? Math.ceil((Date.now() - new Date(ph.activated_at).getTime()) / (1000 * 60 * 60 * 24))
      : ph.completed_at
        ? 0
        : Math.ceil((Date.now() - new Date(ph.created_at).getTime()) / (1000 * 60 * 60 * 24));

    const revisionHeavy = deliverables.filter((d: any) => d.revision_number > 2).length;

    return `  - ${ph.name} [${ph.status}] (${daysInStatus}d in status, ${ph.typical_duration_days}d typical)
    Tasks: ${tasks.completed}/${tasks.total} done${tasks.overdue > 0 ? `, ${tasks.overdue} OVERDUE` : ''}
    Deliverables: ${deliverables.length} total${revisionHeavy > 0 ? `, ${revisionHeavy} with 3+ revisions` : ''}`;
  });

  const changeOrderLines = snap.change_orders.length > 0
    ? snap.change_orders.map((co: any) => `  - ${co.description} ($${((co.amount_cents || 0) / 100).toLocaleString()}) [${co.status}]`).join('\n')
    : '  None';

  return `PROJECT: ${p.name}
TYPE: ${p.project_type?.replace(/_/g, ' ')}
STATUS: ${p.status} | HEALTH: ${p.health}
BRIEF: ${brief}${brief.length >= 500 ? '...' : ''}
BUDGET: ${budgetStr} total, ${spentStr} spent (${snap.budget.percent_used}% used)
TIMELINE: ${snap.days_elapsed} days elapsed${snap.days_remaining !== null ? `, ${snap.days_remaining} days remaining` : ', no deadline set'}
DUE DATE: ${p.due_date ? new Date(p.due_date).toLocaleDateString() : 'None'}

PHASES (${snap.phases.length}):
${phaseLines.join('\n')}

CHANGE ORDERS:
${changeOrderLines}`;
}

// ─── JSON Parsing Helper ─────────────────────────────────

function parseAIJson<T>(raw: string): T {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// ─── Log AI Operation ────────────────────────────────────

async function logOperation(params: {
  projectId: string;
  operationType: string;
  inputData: any;
  outputData: any;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}): Promise<void> {
  await db('ai_operation_logs').insert({
    project_id: params.projectId,
    operation_type: params.operationType,
    model_used: anthropic ? DEFAULT_MODEL : 'mock',
    input_data: params.inputData,
    output_data: params.outputData,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
    latency_ms: params.latencyMs,
  });
}

// ─── Persist Insights with Deduplication ─────────────────

async function persistInsights(
  projectId: string,
  insights: AIPMInsight[],
): Promise<AIPMInsight[]> {
  const persisted: AIPMInsight[] = [];

  for (const insight of insights) {
    // Deduplicate: skip if identical type + title already ACTIVE for this project
    const existing = await db('ai_pm_insights')
      .where({
        project_id: projectId,
        insight_type: insight.insight_type,
        status: InsightStatus.ACTIVE,
      })
      .whereRaw('LOWER(title) = LOWER(?)', [insight.title])
      .first();

    if (existing) continue;

    const [row] = await db('ai_pm_insights')
      .insert({
        project_id: projectId,
        insight_type: insight.insight_type,
        severity: insight.severity,
        title: insight.title,
        summary: insight.summary,
        details: JSON.stringify(insight.details),
        recommendations: JSON.stringify(insight.recommendations),
        status: InsightStatus.ACTIVE,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .returning('*');

    persisted.push(row);
  }

  return persisted;
}

// ═════════════════════════════════════════════════════════
// PUBLIC API
// ═════════════════════════════════════════════════════════

/**
 * Scan a project's health and return structured insights.
 * Main workhorse — gathers full snapshot, sends to Claude, returns insights.
 */
export async function scanProjectHealth(projectId: string): Promise<AIPMInsight[]> {
  const startTime = Date.now();
  const snapshot = await buildProjectSnapshot(projectId);
  if (!snapshot) throw new Error('Project not found');

  const promptText = snapshotToPromptText(snapshot);

  const systemPrompt = `You are the Roster AI Project Manager. Analyze the project data and produce actionable insights. For each insight, assess severity: CRITICAL (blocks progress, needs immediate action), WARNING (potential issue, monitor closely), INFO (observation, helpful context).

Return a JSON array of insight objects (max 8). Each must have:
- "insight_type": One of HEALTH_CHECK, RISK_DETECTION, BUDGET_ANALYSIS, TIMELINE_ALERT, PHASE_RECOMMENDATION, WORKLOAD_ALERT, MILESTONE_ALERT
- "severity": INFO | WARNING | CRITICAL
- "title": Short headline (max 80 chars)
- "summary": 1-2 sentence explanation
- "details": Object with supporting data
- "recommendations": Array of 1-3 actionable next steps

Focus on:
1. Phases that have been in status longer than their typical_duration_days
2. Overdue tasks
3. Budget burn rate vs remaining timeline
4. Deliverables with 3+ revisions (quality concerns)
5. Blocked or idle phases
6. Overall project health assessment

Only flag real issues. Don't generate filler insights.`;

  let rawInsights: Array<{
    insight_type: string;
    severity: string;
    title: string;
    summary: string;
    details: Record<string, unknown>;
    recommendations: string[];
  }>;
  let inputTokens = 0;
  let outputTokens = 0;

  if (anthropic) {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: promptText }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    rawInsights = parseAIJson(textContent?.text || '[]');
    inputTokens = response.usage.input_tokens;
    outputTokens = response.usage.output_tokens;
  } else {
    rawInsights = generateMockHealthInsights(snapshot);
    inputTokens = 800;
    outputTokens = 1200;
  }

  const latencyMs = Date.now() - startTime;

  // Map to typed insights
  const insights: AIPMInsight[] = rawInsights.slice(0, 8).map((r) => ({
    project_id: projectId,
    insight_type: (InsightType as any)[r.insight_type] || InsightType.HEALTH_CHECK,
    severity: (InsightSeverity as any)[r.severity] || InsightSeverity.INFO,
    title: r.title,
    summary: r.summary,
    details: r.details || {},
    recommendations: r.recommendations || [],
    status: InsightStatus.ACTIVE,
  }));

  // Persist with dedup
  const persisted = await persistInsights(projectId, insights);

  // Log operation
  await logOperation({
    projectId,
    operationType: 'ai_pm_health_scan',
    inputData: { project_name: snapshot.project.name, phase_count: snapshot.phases.length },
    outputData: { insight_count: persisted.length },
    inputTokens,
    outputTokens,
    latencyMs,
  });

  // Notify on critical insights
  const criticals = persisted.filter((i) => i.severity === InsightSeverity.CRITICAL);
  if (criticals.length > 0) {
    const stakeholders = await getProjectStakeholders(projectId);
    for (const critical of criticals) {
      await notifyAndLog({
        projectId,
        notifyUserIds: stakeholders,
        notificationType: 'ai_pm_critical',
        activityType: 'ai_pm_insight_created',
        title: `AI PM Critical: ${critical.title}`,
        body: critical.summary,
        link: `/projects/${projectId}?tab=ai-pm`,
        metadata: { insight_type: critical.insight_type, severity: 'CRITICAL' },
      });
    }
  }

  // Post activity for the scan itself
  await db('activity_feed').insert({
    project_id: projectId,
    type: 'ai_pm_scan',
    title: 'AI PM health scan completed',
    body: `Generated ${persisted.length} insight(s)${criticals.length > 0 ? ` including ${criticals.length} critical` : ''}`,
    metadata: JSON.stringify({ insight_count: persisted.length, critical_count: criticals.length }),
  }).catch(() => { /* Activity feed table may not exist yet */ });

  return persisted;
}

/**
 * Generate a comprehensive status report for a project.
 */
export async function generateStatusReport(projectId: string): Promise<StatusReport> {
  const startTime = Date.now();
  const snapshot = await buildProjectSnapshot(projectId);
  if (!snapshot) throw new Error('Project not found');

  const promptText = snapshotToPromptText(snapshot);

  const systemPrompt = `You are the Roster AI Project Manager generating a status report for a PM to share with the client. Be professional, concise, and actionable.

Return a JSON object with:
- "executive_summary": 2-3 sentence high-level overview
- "phase_status": Array of { "name", "status", "days_in_status", "notes" } for each phase
- "budget_summary": { "total_cents", "spent_cents", "percent_used", "burn_rate_per_day", "projected_total", "assessment" }
- "risks": Array of { "title", "severity" (HIGH/MEDIUM/LOW), "mitigation" }
- "next_steps": Array of 3-5 concrete next actions
- "overall_health": GREEN | AMBER | RED with brief justification`;

  let result: StatusReport;
  let inputTokens = 0;
  let outputTokens = 0;

  if (anthropic) {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: promptText }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    result = parseAIJson(textContent?.text || '{}');
    inputTokens = response.usage.input_tokens;
    outputTokens = response.usage.output_tokens;
  } else {
    result = generateMockStatusReport(snapshot);
    inputTokens = 600;
    outputTokens = 1000;
  }

  const latencyMs = Date.now() - startTime;

  await logOperation({
    projectId,
    operationType: 'ai_pm_status_report',
    inputData: { project_name: snapshot.project.name },
    outputData: result,
    inputTokens,
    outputTokens,
    latencyMs,
  });

  // Activity entry
  await db('activity_feed').insert({
    project_id: projectId,
    type: 'status_report_generated',
    title: 'AI PM status report generated',
    body: result.executive_summary?.substring(0, 200),
    metadata: JSON.stringify({ overall_health: result.overall_health }),
  }).catch(() => {});

  return result;
}

/**
 * Analyze budget burn rate and projections.
 */
export async function analyzeBudgetBurn(projectId: string): Promise<BudgetAnalysis> {
  const startTime = Date.now();
  const snapshot = await buildProjectSnapshot(projectId);
  if (!snapshot) throw new Error('Project not found');

  const promptText = snapshotToPromptText(snapshot);

  const systemPrompt = `You are the Roster AI Project Manager analyzing project budget health. Calculate burn rate, project costs forward, and identify optimization opportunities.

Return a JSON object with:
- "burn_rate_per_day_cents": Average daily spend based on elapsed time
- "projected_total_cents": Projected total spend at current burn rate
- "runway_days": How many days until budget is exhausted at current rate
- "percent_used": Current percentage of budget spent
- "status": "healthy" | "warning" | "critical" | "over_budget"
- "recommendations": Array of 2-4 specific budget recommendations
- "optimization_opportunities": Array of cost-saving suggestions`;

  let result: BudgetAnalysis;
  let inputTokens = 0;
  let outputTokens = 0;

  if (anthropic) {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: promptText }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    result = parseAIJson(textContent?.text || '{}');
    inputTokens = response.usage.input_tokens;
    outputTokens = response.usage.output_tokens;
  } else {
    result = generateMockBudgetAnalysis(snapshot);
    inputTokens = 400;
    outputTokens = 600;
  }

  const latencyMs = Date.now() - startTime;

  await logOperation({
    projectId,
    operationType: 'ai_pm_budget_analysis',
    inputData: { budget: snapshot.budget },
    outputData: result,
    inputTokens,
    outputTokens,
    latencyMs,
  });

  return result;
}

/**
 * Focused risk detection scan.
 */
export async function detectRisks(projectId: string): Promise<AIPMInsight[]> {
  const startTime = Date.now();
  const snapshot = await buildProjectSnapshot(projectId);
  if (!snapshot) throw new Error('Project not found');

  const promptText = snapshotToPromptText(snapshot);

  const systemPrompt = `You are the Roster AI Project Manager performing a focused risk scan. Identify only genuine risks and potential blockers.

Focus on:
1. Bottleneck phases (active longer than typical_duration_days)
2. Overdue tasks
3. Deliverables with excessive revisions (3+)
4. Phases without assigned creatives
5. Budget trajectory issues
6. Approaching or missed deadlines

Return a JSON array of risk insight objects (max 5). Each must have:
- "insight_type": "RISK_DETECTION"
- "severity": "WARNING" or "CRITICAL"
- "title": Short risk headline
- "summary": 1-2 sentence explanation
- "details": Supporting data
- "recommendations": 1-2 mitigation steps

Only include genuine risks. Return empty array [] if project is healthy.`;

  let rawInsights: Array<any>;
  let inputTokens = 0;
  let outputTokens = 0;

  if (anthropic) {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: promptText }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    rawInsights = parseAIJson(textContent?.text || '[]');
    inputTokens = response.usage.input_tokens;
    outputTokens = response.usage.output_tokens;
  } else {
    rawInsights = generateMockRiskInsights(snapshot);
    inputTokens = 500;
    outputTokens = 800;
  }

  const latencyMs = Date.now() - startTime;

  const insights: AIPMInsight[] = rawInsights.slice(0, 5).map((r: any) => ({
    project_id: projectId,
    insight_type: InsightType.RISK_DETECTION,
    severity: (InsightSeverity as any)[r.severity] || InsightSeverity.WARNING,
    title: r.title,
    summary: r.summary,
    details: r.details || {},
    recommendations: r.recommendations || [],
    status: InsightStatus.ACTIVE,
  }));

  const persisted = await persistInsights(projectId, insights);

  await logOperation({
    projectId,
    operationType: 'ai_pm_risk_detection',
    inputData: { project_name: snapshot.project.name },
    outputData: { risk_count: persisted.length },
    inputTokens,
    outputTokens,
    latencyMs,
  });

  return persisted;
}

/**
 * Suggest phase-level actions (transitions, assignments, workflow adjustments).
 */
export async function suggestPhaseActions(projectId: string): Promise<PhaseRecommendation[]> {
  const startTime = Date.now();
  const snapshot = await buildProjectSnapshot(projectId);
  if (!snapshot) throw new Error('Project not found');

  const promptText = snapshotToPromptText(snapshot);

  const systemPrompt = `You are the Roster AI Project Manager. Analyze the project phases and recommend specific actions the PM should take.

Return a JSON array of recommendations (max 5). Each must have:
- "phase_name": Name of the phase this applies to
- "phase_id": ID of the phase (from the data provided)
- "action": Specific action to take (e.g., "Activate phase", "Reassign creative", "Extend timeline")
- "rationale": Why this action is recommended
- "priority": "high" | "medium" | "low"

Focus on actionable, specific recommendations. Not general advice.`;

  let result: PhaseRecommendation[];
  let inputTokens = 0;
  let outputTokens = 0;

  if (anthropic) {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: promptText }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    result = parseAIJson(textContent?.text || '[]');
    inputTokens = response.usage.input_tokens;
    outputTokens = response.usage.output_tokens;
  } else {
    result = generateMockPhaseRecommendations(snapshot);
    inputTokens = 400;
    outputTokens = 600;
  }

  const latencyMs = Date.now() - startTime;

  await logOperation({
    projectId,
    operationType: 'ai_pm_phase_recommendations',
    inputData: { project_name: snapshot.project.name },
    outputData: result,
    inputTokens,
    outputTokens,
    latencyMs,
  });

  return result.slice(0, 5);
}

// ═════════════════════════════════════════════════════════
// MOCK GENERATORS (deterministic, based on actual project state)
// ═════════════════════════════════════════════════════════

function generateMockHealthInsights(snap: ProjectSnapshot): Array<any> {
  const insights: Array<any> = [];
  const p = snap.project;

  // Budget check
  if (snap.budget.percent_used > 75) {
    insights.push({
      insight_type: InsightType.BUDGET_ANALYSIS,
      severity: snap.budget.percent_used > 90 ? InsightSeverity.CRITICAL : InsightSeverity.WARNING,
      title: `Budget ${snap.budget.percent_used}% consumed`,
      summary: `The project has used ${snap.budget.percent_used}% of its budget ($${(snap.budget.spent_cents / 100).toLocaleString()} of $${(snap.budget.total_cents / 100).toLocaleString()}). ${snap.budget.percent_used > 90 ? 'Immediate attention required.' : 'Monitor spending closely.'}`,
      details: { percent_used: snap.budget.percent_used, spent_cents: snap.budget.spent_cents, total_cents: snap.budget.total_cents },
      recommendations: snap.budget.percent_used > 90
        ? ['Review remaining deliverables and prioritize essentials', 'Discuss scope reduction or budget increase with client', 'Pause non-critical phases']
        : ['Track daily burn rate', 'Review upcoming phase costs before activating'],
    });
  }

  // Phase duration check
  for (const phase of snap.phases) {
    if (phase.status === 'ACTIVE' && phase.activated_at) {
      const daysActive = Math.ceil((Date.now() - new Date(phase.activated_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysActive > phase.typical_duration_days * 1.5) {
        insights.push({
          insight_type: InsightType.TIMELINE_ALERT,
          severity: daysActive > phase.typical_duration_days * 2 ? InsightSeverity.CRITICAL : InsightSeverity.WARNING,
          title: `${phase.name} running ${daysActive - phase.typical_duration_days} days over`,
          summary: `Phase "${phase.name}" has been active for ${daysActive} days, exceeding the typical ${phase.typical_duration_days}-day duration. This may indicate blockers or scope creep.`,
          details: { phase_id: phase.id, days_active: daysActive, typical_days: phase.typical_duration_days },
          recommendations: ['Check in with assigned creative on blockers', 'Review deliverable expectations for this phase'],
        });
      }
    }
  }

  // Overdue tasks
  let totalOverdue = 0;
  for (const phaseId of Object.keys(snap.tasks_by_phase)) {
    totalOverdue += snap.tasks_by_phase[phaseId].overdue;
  }
  if (totalOverdue > 0) {
    insights.push({
      insight_type: InsightType.RISK_DETECTION,
      severity: totalOverdue > 3 ? InsightSeverity.CRITICAL : InsightSeverity.WARNING,
      title: `${totalOverdue} overdue task${totalOverdue > 1 ? 's' : ''} detected`,
      summary: `There ${totalOverdue === 1 ? 'is' : 'are'} ${totalOverdue} overdue task${totalOverdue > 1 ? 's' : ''} across the project. This may cascade into phase delays.`,
      details: { overdue_count: totalOverdue },
      recommendations: ['Review and reprioritize overdue tasks', 'Consider extending deadlines or reassigning work'],
    });
  }

  // Revision-heavy deliverables
  let revisionHeavyCount = 0;
  for (const phaseId of Object.keys(snap.deliverables_by_phase)) {
    revisionHeavyCount += snap.deliverables_by_phase[phaseId].filter((d: any) => d.revision_number > 2).length;
  }
  if (revisionHeavyCount > 0) {
    insights.push({
      insight_type: InsightType.RISK_DETECTION,
      severity: InsightSeverity.WARNING,
      title: `${revisionHeavyCount} deliverable${revisionHeavyCount > 1 ? 's' : ''} with excessive revisions`,
      summary: `${revisionHeavyCount} deliverable${revisionHeavyCount > 1 ? 's have' : ' has'} gone through 3+ revision rounds. This may indicate misalignment on expectations.`,
      details: { revision_heavy_count: revisionHeavyCount },
      recommendations: ['Schedule alignment call between PM, client, and creative', 'Clarify acceptance criteria before next round'],
    });
  }

  // Timeline check
  if (snap.days_remaining !== null && snap.days_remaining < 7 && snap.days_remaining > 0) {
    const pendingPhases = snap.phases.filter((ph: any) => ph.status === 'PENDING' || ph.status === 'ACTIVE').length;
    if (pendingPhases > 1) {
      insights.push({
        insight_type: InsightType.TIMELINE_ALERT,
        severity: InsightSeverity.CRITICAL,
        title: 'Deadline at risk — less than 7 days remaining',
        summary: `Only ${snap.days_remaining} days until the due date, but ${pendingPhases} phases are still pending or active. The deadline is at risk.`,
        details: { days_remaining: snap.days_remaining, pending_phases: pendingPhases },
        recommendations: ['Assess which phases can be fast-tracked', 'Discuss timeline extension with client'],
      });
    }
  }

  // Overall health
  if (insights.length === 0) {
    insights.push({
      insight_type: InsightType.HEALTH_CHECK,
      severity: InsightSeverity.INFO,
      title: 'Project health is on track',
      summary: `"${p.name}" is progressing within expected parameters. Budget, timeline, and phase progress all look healthy.`,
      details: { health: p.health, budget_percent: snap.budget.percent_used },
      recommendations: ['Continue monitoring — no action needed'],
    });
  }

  return insights;
}

function generateMockStatusReport(snap: ProjectSnapshot): StatusReport {
  const p = snap.project;
  const completedCount = snap.phases.filter((ph: any) => ph.status === 'COMPLETE').length;
  const activeCount = snap.phases.filter((ph: any) => ph.status === 'ACTIVE').length;
  const burnPerDay = snap.days_elapsed > 0 ? Math.round(snap.budget.spent_cents / snap.days_elapsed) : 0;

  return {
    executive_summary: `"${p.name}" is ${completedCount}/${snap.phases.length} phases complete with ${snap.budget.percent_used}% of budget used. ${activeCount > 0 ? `${activeCount} phase${activeCount > 1 ? 's are' : ' is'} currently active.` : 'No phases are currently active.'} ${snap.days_remaining !== null ? `${snap.days_remaining} days remain until the deadline.` : ''}`,
    phase_status: snap.phases.map((ph: any) => {
      const daysInStatus = ph.activated_at
        ? Math.ceil((Date.now() - new Date(ph.activated_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      return {
        name: ph.name,
        status: ph.status,
        days_in_status: daysInStatus,
        notes: ph.status === 'COMPLETE' ? 'Completed successfully' : ph.status === 'ACTIVE' ? `In progress (${daysInStatus} days)` : 'Awaiting dependencies',
      };
    }),
    budget_summary: {
      total_cents: snap.budget.total_cents,
      spent_cents: snap.budget.spent_cents,
      percent_used: snap.budget.percent_used,
      burn_rate_per_day: burnPerDay,
      projected_total: snap.days_remaining !== null ? snap.budget.spent_cents + (burnPerDay * snap.days_remaining) : snap.budget.spent_cents,
      assessment: snap.budget.percent_used > 90 ? 'Budget is critically low' : snap.budget.percent_used > 70 ? 'Budget requires monitoring' : 'Budget is healthy',
    },
    risks: snap.budget.percent_used > 75
      ? [{ title: 'Budget overrun risk', severity: 'HIGH', mitigation: 'Review remaining scope and prioritize' }]
      : [],
    next_steps: [
      activeCount > 0 ? `Complete active phase${activeCount > 1 ? 's' : ''} and review deliverables` : 'Activate next phase',
      'Review budget trajectory with team',
      'Update client on progress',
    ],
    overall_health: snap.budget.percent_used > 90 ? 'RED' : snap.budget.percent_used > 70 ? 'AMBER' : 'GREEN',
  };
}

function generateMockBudgetAnalysis(snap: ProjectSnapshot): BudgetAnalysis {
  const burnPerDay = snap.days_elapsed > 0 ? Math.round(snap.budget.spent_cents / snap.days_elapsed) : 0;
  const runway = burnPerDay > 0 ? Math.round((snap.budget.total_cents - snap.budget.spent_cents) / burnPerDay) : 999;
  const projected = snap.days_remaining !== null
    ? snap.budget.spent_cents + (burnPerDay * Math.max(0, snap.days_remaining))
    : snap.budget.spent_cents;

  const status: BudgetAnalysis['status'] =
    snap.budget.percent_used > 100 ? 'over_budget' :
    snap.budget.percent_used > 90 ? 'critical' :
    snap.budget.percent_used > 75 ? 'warning' : 'healthy';

  return {
    burn_rate_per_day_cents: burnPerDay,
    projected_total_cents: projected,
    runway_days: runway,
    percent_used: snap.budget.percent_used,
    status,
    recommendations: status === 'healthy'
      ? ['Continue current pace — budget is on track', 'Review costs before activating next phase']
      : ['Prioritize essential deliverables', 'Discuss budget adjustment with client', 'Consider phasing remaining work'],
    optimization_opportunities: [
      'Consolidate review rounds to reduce revision costs',
      'Pre-approve deliverable criteria to minimize back-and-forth',
    ],
  };
}

function generateMockRiskInsights(snap: ProjectSnapshot): Array<any> {
  const risks: Array<any> = [];

  // Check for phases exceeding typical duration
  for (const phase of snap.phases) {
    if (phase.status === 'ACTIVE' && phase.activated_at) {
      const daysActive = Math.ceil((Date.now() - new Date(phase.activated_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysActive > phase.typical_duration_days * 1.3) {
        risks.push({
          insight_type: 'RISK_DETECTION',
          severity: daysActive > phase.typical_duration_days * 2 ? 'CRITICAL' : 'WARNING',
          title: `${phase.name} exceeding expected timeline`,
          summary: `Phase has been active for ${daysActive} days vs expected ${phase.typical_duration_days} days.`,
          details: { phase_id: phase.id, days_active: daysActive },
          recommendations: ['Review phase progress with assigned creative'],
        });
      }
    }
  }

  // Check budget
  if (snap.budget.percent_used > 80) {
    risks.push({
      insight_type: 'RISK_DETECTION',
      severity: snap.budget.percent_used > 95 ? 'CRITICAL' : 'WARNING',
      title: 'Budget exhaustion risk',
      summary: `${snap.budget.percent_used}% of budget spent with work remaining.`,
      details: { percent_used: snap.budget.percent_used },
      recommendations: ['Evaluate remaining scope against budget'],
    });
  }

  return risks;
}

function generateMockPhaseRecommendations(snap: ProjectSnapshot): PhaseRecommendation[] {
  const recommendations: PhaseRecommendation[] = [];

  for (const phase of snap.phases) {
    // Suggest activating phases whose deps are met
    if (phase.status === 'PENDING') {
      const deps: string[] = phase.depends_on || [];
      const allDepsMet = deps.every((depId: string) => {
        const dep = snap.phases.find((p: any) => p.id === depId);
        return dep?.status === 'COMPLETE';
      });
      if (allDepsMet && deps.length > 0) {
        recommendations.push({
          phase_name: phase.name,
          phase_id: phase.id,
          action: 'Activate phase — all dependencies are complete',
          rationale: `All prerequisite phases are complete. This phase can begin immediately.`,
          priority: 'high',
        });
      }
    }

    // Suggest review for long-running active phases
    if (phase.status === 'ACTIVE' && phase.activated_at) {
      const daysActive = Math.ceil((Date.now() - new Date(phase.activated_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysActive > phase.typical_duration_days) {
        recommendations.push({
          phase_name: phase.name,
          phase_id: phase.id,
          action: 'Review progress — phase is running over estimated duration',
          rationale: `Active for ${daysActive} days vs typical ${phase.typical_duration_days} days. May need intervention.`,
          priority: daysActive > phase.typical_duration_days * 2 ? 'high' : 'medium',
        });
      }
    }
  }

  return recommendations;
}
