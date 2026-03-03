/**
 * Budget Service — Spec System 10
 * Tracks project spending, generates alerts at thresholds (50%, 75%, 90%).
 */
import { db } from '../config/database.js';
import { notifyAndLog, getProjectStakeholders } from './notifications.js';
import { enqueueProjectScan } from '../jobs/aiPMWorker.js';

const BUDGET_THRESHOLDS = [
  { percent: 50, label: '50%', severity: 'info' },
  { percent: 75, label: '75%', severity: 'warning' },
  { percent: 90, label: '90%', severity: 'danger' },
];

/**
 * Record spending against a project and trigger budget alerts if needed.
 */
export async function recordSpending(params: {
  projectId: string;
  amountCents: number;
  description: string;
  userId?: string;
}): Promise<{ newSpentCents: number; budgetPercent: number; alerts: string[] }> {
  const project = await db('projects').where({ id: params.projectId }).first();
  if (!project) throw new Error('Project not found');

  const prevSpent = project.spent_cents || 0;
  const newSpent = prevSpent + params.amountCents;

  await db('projects')
    .where({ id: params.projectId })
    .update({
      spent_cents: newSpent,
      updated_at: new Date(),
    });

  const budgetPercent = project.budget_cents > 0
    ? Math.round((newSpent / project.budget_cents) * 100)
    : 0;
  const prevPercent = project.budget_cents > 0
    ? Math.round((prevSpent / project.budget_cents) * 100)
    : 0;

  const alerts: string[] = [];

  // Check if we crossed any thresholds
  for (const threshold of BUDGET_THRESHOLDS) {
    if (prevPercent < threshold.percent && budgetPercent >= threshold.percent) {
      alerts.push(threshold.label);

      // Notify stakeholders
      const stakeholders = await getProjectStakeholders(params.projectId);
      const budgetFormatted = `$${(project.budget_cents / 100).toLocaleString()}`;
      const spentFormatted = `$${(newSpent / 100).toLocaleString()}`;

      await notifyAndLog({
        projectId: params.projectId,
        notifyUserIds: stakeholders,
        notificationType: 'budget_warning',
        activityType: 'budget_update',
        title: `Budget ${threshold.label} reached`,
        body: `${spentFormatted} of ${budgetFormatted} has been spent on ${project.name}.`,
        link: `/projects/${params.projectId}`,
        actorUserId: params.userId,
        metadata: { threshold: threshold.percent, spent_cents: newSpent, budget_cents: project.budget_cents },
      });

      // Update project health if over 90%
      if (threshold.percent >= 90 && project.health !== 'RED') {
        await db('projects')
          .where({ id: params.projectId })
          .update({ health: 'AMBER', updated_at: new Date() });
      }
    }
  }

  // Trigger AI PM scan if budget threshold crossed
  if (alerts.length > 0) {
    enqueueProjectScan(params.projectId).catch(() => {});
  }

  return { newSpentCents: newSpent, budgetPercent, alerts };
}

/**
 * Get budget summary for a project.
 */
export async function getBudgetSummary(projectId: string) {
  const project = await db('projects')
    .where({ id: projectId })
    .select('budget_cents', 'spent_cents', 'name')
    .first();

  if (!project) return null;

  const budgetCents = project.budget_cents || 0;
  const spentCents = project.spent_cents || 0;
  const remainingCents = budgetCents - spentCents;
  const percentUsed = budgetCents > 0 ? Math.round((spentCents / budgetCents) * 100) : 0;

  return {
    budget_cents: budgetCents,
    spent_cents: spentCents,
    remaining_cents: remainingCents,
    percent_used: percentUsed,
    status: percentUsed >= 90 ? 'critical' : percentUsed >= 75 ? 'warning' : 'healthy',
  };
}
