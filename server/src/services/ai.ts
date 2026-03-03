/**
 * AI Service — Wraps Anthropic SDK for all AI operations.
 * Spec System 04: AI services using prompt templates with logging.
 *
 * In dev mode (no API key), returns mock responses so the app works
 * without a real Anthropic account.
 */
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../config/database.js';
import { config } from '../config/index.js';

// Initialize client (may be null in dev if no key)
const anthropic = config.anthropic.apiKey
  ? new Anthropic({ apiKey: config.anthropic.apiKey })
  : null;

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

// ─── Types ──────────────────────────────────────────────

export interface BriefReflection {
  summary: string;
  deliverables: string[];
  ambiguities: string[];
  proposed_timeline_days: number;
  phase_notes: string;
  flagged_gaps: string[];
  team_recommendations: string[];
  budget_assessment: string;
}

export interface TimelineSuggestion {
  phases: Array<{
    name: string;
    suggested_days: number;
    rationale: string;
    risks: string[];
  }>;
  total_days: number;
  fast_track_option: {
    total_days: number;
    tradeoffs: string[];
  };
  notes: string;
}

export interface PMAssignmentScore {
  user_id: string;
  score: number;
  rationale: string;
}

// ─── Brief Reflection ───────────────────────────────────

export async function reflectOnBrief(params: {
  projectId: string;
  projectType: string;
  brief: string;
  brandData?: Record<string, unknown>;
  budgetCents: number;
}): Promise<BriefReflection> {
  const startTime = Date.now();

  // Load the prompt template
  const template = await db('prompt_templates')
    .where({ name: 'brief_parsing', is_active: true })
    .first();

  if (!template) {
    throw new Error('brief_parsing prompt template not found');
  }

  // Build user prompt from template
  const userPrompt = template.user_prompt_template
    .replace('{{project_type}}', params.projectType.replace(/_/g, ' '))
    .replace('{{brief}}', params.brief)
    .replace('{{brand_data}}', params.brandData ? JSON.stringify(params.brandData, null, 2) : 'No brand data provided');

  // Enhanced system prompt with budget context
  const systemPrompt = template.system_prompt + `\n\nBudget context: The client has allocated $${(params.budgetCents / 100).toLocaleString()} for this project. Consider this when assessing feasibility and making recommendations.

Additionally, provide these extra fields in your JSON response:
7. "team_recommendations": Array of recommended creative roles/disciplines for the project
8. "budget_assessment": A one-sentence assessment of whether the budget is realistic for the scope`;

  let result: BriefReflection;
  let inputTokens = 0;
  let outputTokens = 0;

  if (anthropic) {
    // Real API call
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    const rawText = textContent?.text || '{}';

    // Parse JSON from response (handle markdown code blocks)
    const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    result = JSON.parse(jsonStr);
    inputTokens = response.usage.input_tokens;
    outputTokens = response.usage.output_tokens;
  } else {
    // Dev mock response
    result = generateMockBriefReflection(params);
    inputTokens = 500;
    outputTokens = 800;
  }

  const latencyMs = Date.now() - startTime;

  // Log the operation
  await db('ai_operation_logs').insert({
    prompt_template_id: template.id,
    project_id: params.projectId,
    operation_type: 'brief_parsing',
    model_used: anthropic ? DEFAULT_MODEL : 'mock',
    input_data: { project_type: params.projectType, brief: params.brief, budget_cents: params.budgetCents },
    output_data: result,
    prompt_version: template.version,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    latency_ms: latencyMs,
  });

  return result;
}

// ─── Timeline Suggestions ───────────────────────────────

export async function suggestTimeline(params: {
  projectId: string;
  projectType: string;
  brief: string;
  phases: Array<{ name: string; description: string; typical_duration_days: number }>;
  budgetCents: number;
}): Promise<TimelineSuggestion> {
  const startTime = Date.now();

  const systemPrompt = `You are the Roster AI Project Manager. Analyze the project brief and suggest optimized timelines for each phase. Consider dependencies, typical creative workflows, and the client's budget. Be realistic but efficient.

Return a JSON object with:
- "phases": Array of { "name": string, "suggested_days": number, "rationale": string, "risks": string[] }
- "total_days": number (total working days)
- "fast_track_option": { "total_days": number, "tradeoffs": string[] }
- "notes": string (general timeline notes)`;

  const userPrompt = `PROJECT TYPE: ${params.projectType.replace(/_/g, ' ')}
BRIEF: ${params.brief}
BUDGET: $${(params.budgetCents / 100).toLocaleString()}

STANDARD PHASES:
${params.phases.map((p, i) => `${i + 1}. ${p.name} — ${p.description} (typical: ${p.typical_duration_days} days)`).join('\n')}

Analyze and suggest optimized timelines for each phase.`;

  let result: TimelineSuggestion;
  let inputTokens = 0;
  let outputTokens = 0;

  if (anthropic) {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    const rawText = textContent?.text || '{}';
    const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    result = JSON.parse(jsonStr);
    inputTokens = response.usage.input_tokens;
    outputTokens = response.usage.output_tokens;
  } else {
    result = generateMockTimelineSuggestion(params.phases);
    inputTokens = 400;
    outputTokens = 600;
  }

  const latencyMs = Date.now() - startTime;

  await db('ai_operation_logs').insert({
    project_id: params.projectId,
    operation_type: 'timeline_suggestion',
    model_used: anthropic ? DEFAULT_MODEL : 'mock',
    input_data: { project_type: params.projectType, phase_count: params.phases.length },
    output_data: result,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    latency_ms: latencyMs,
  });

  return result;
}

// ─── PM Assignment Scoring ──────────────────────────────

export async function scorePMCandidates(params: {
  projectType: string;
  brief: string;
  candidates: Array<{
    user_id: string;
    name: string;
    active_project_count: number;
    completed_project_count: number;
    avg_rating: number;
    specialties: string[];
  }>;
}): Promise<PMAssignmentScore[]> {
  if (params.candidates.length === 0) return [];

  const systemPrompt = `You are the Roster platform's PM assignment engine. Score each PM candidate from 0-100 based on fit for this project. Consider their workload, experience, specialties, and ratings. Return a JSON array of objects with: "user_id", "score" (0-100), "rationale" (brief explanation).`;

  const userPrompt = `PROJECT TYPE: ${params.projectType.replace(/_/g, ' ')}
BRIEF SUMMARY: ${params.brief.substring(0, 500)}

PM CANDIDATES:
${params.candidates.map(c => `- ${c.name} (ID: ${c.user_id}): ${c.active_project_count} active projects, ${c.completed_project_count} completed, avg rating ${c.avg_rating.toFixed(1)}, specialties: ${c.specialties.join(', ') || 'general'}`).join('\n')}

Score each candidate for fit.`;

  let result: PMAssignmentScore[];

  if (anthropic) {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    const rawText = textContent?.text || '[]';
    const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    result = JSON.parse(jsonStr);
  } else {
    // Mock scoring: prefer lower active projects and higher ratings
    result = params.candidates.map(c => ({
      user_id: c.user_id,
      score: Math.round(
        Math.max(0, 100 - (c.active_project_count * 15)) *
        (c.avg_rating / 5) *
        (c.completed_project_count > 0 ? 1 : 0.7)
      ),
      rationale: `${c.name} has ${c.active_project_count} active project(s) and a ${c.avg_rating.toFixed(1)} rating.`,
    }));
  }

  return result.sort((a, b) => b.score - a.score);
}

// ─── Mock Generators ────────────────────────────────────

function generateMockBriefReflection(params: {
  projectType: string;
  brief: string;
  budgetCents: number;
}): BriefReflection {
  const projectName = params.projectType.replace(/_/g, ' ').toLowerCase();
  const budget = params.budgetCents / 100;

  return {
    summary: `The client is requesting a ${projectName} project. ${params.brief.substring(0, 100)}${params.brief.length > 100 ? '...' : ''} This will require a focused creative team with clear deliverable milestones.`,
    deliverables: [
      'Initial concept deck with 3 creative directions',
      'Refined concept with brand applications',
      'Final production-ready assets',
      'Brand usage guidelines document',
    ],
    ambiguities: [
      'Target audience demographics are not specified — recommend clarifying primary vs secondary audiences.',
      'No specific competitor references or examples of desired style direction.',
      'Unclear whether this needs to account for multilingual or international adaptations.',
    ],
    proposed_timeline_days: 21,
    phase_notes: 'Standard workflow template is appropriate. Consider adding an extra review checkpoint between concept and refinement phases given the scope.',
    flagged_gaps: [
      'No brand guidelines uploaded to Brand Vault — creative team will need these before starting.',
      'Budget may be tight for the full scope if premium photography is required.',
    ],
    team_recommendations: [
      'Lead Art Director or Senior Designer',
      'Brand Strategist for concept phase',
      'Production Designer for final assets',
    ],
    budget_assessment: budget >= 10000
      ? `The $${budget.toLocaleString()} budget is reasonable for this scope of ${projectName} work.`
      : `The $${budget.toLocaleString()} budget is tight for this scope — consider reducing deliverables or phasing the work.`,
  };
}

function generateMockTimelineSuggestion(
  phases: Array<{ name: string; description: string; typical_duration_days: number }>
): TimelineSuggestion {
  const phaseResults = phases.map(p => ({
    name: p.name,
    suggested_days: p.typical_duration_days,
    rationale: `Standard timeline for ${p.name.toLowerCase()} based on project complexity.`,
    risks: [`Delays if client feedback takes more than 2 business days during ${p.name.toLowerCase()}.`],
  }));

  const totalDays = phaseResults.reduce((sum, p) => sum + p.suggested_days, 0);

  return {
    phases: phaseResults,
    total_days: totalDays,
    fast_track_option: {
      total_days: Math.ceil(totalDays * 0.7),
      tradeoffs: [
        'Fewer revision rounds (1 instead of 2)',
        'Parallel execution of independent phases',
        'Requires dedicated creative availability',
      ],
    },
    notes: 'Timeline assumes standard business days with client feedback within 48 hours per review cycle.',
  };
}
