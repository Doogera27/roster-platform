/**
 * Notification Service — Spec System 08
 * Creates notifications and activity feed entries.
 * Also handles notification dispatch (in-app for now, email later via SendGrid).
 */
import { db } from '../config/database.js';

export type NotificationType =
  | 'project_created'
  | 'project_started'
  | 'project_completed'
  | 'phase_activated'
  | 'phase_completed'
  | 'deliverable_submitted'
  | 'deliverable_approved'
  | 'deliverable_revision'
  | 'pm_assigned'
  | 'brief_reflection_ready'
  | 'budget_warning'
  | 'health_changed'
  | 'comment_added'
  | 'ai_pm_insight'
  | 'ai_pm_critical'
  | 'status_report_ready'
  | 'general';

export type ActivityType =
  | 'project_created'
  | 'project_status_changed'
  | 'phase_activated'
  | 'phase_completed'
  | 'deliverable_submitted'
  | 'deliverable_reviewed'
  | 'pm_assigned'
  | 'brief_reflection'
  | 'budget_update'
  | 'health_update'
  | 'ai_pm_scan'
  | 'ai_pm_insight_created'
  | 'status_report_generated'
  | 'comment';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  projectId?: string;
}

interface CreateActivityParams {
  projectId: string;
  userId?: string;
  type: ActivityType;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send a notification to a single user.
 */
export async function notify(params: CreateNotificationParams): Promise<void> {
  await db('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body || null,
    link: params.link || null,
    project_id: params.projectId || null,
  });
}

/**
 * Send notifications to multiple users at once.
 */
export async function notifyMany(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
): Promise<void> {
  if (userIds.length === 0) return;

  const rows = userIds.map(userId => ({
    user_id: userId,
    type: params.type,
    title: params.title,
    body: params.body || null,
    link: params.link || null,
    project_id: params.projectId || null,
  }));

  await db('notifications').insert(rows);
}

/**
 * Post an activity entry to a project's activity feed.
 */
export async function postActivity(params: CreateActivityParams): Promise<void> {
  await db('activity_feed').insert({
    project_id: params.projectId,
    user_id: params.userId || null,
    type: params.type,
    title: params.title,
    body: params.body || null,
    metadata: params.metadata || {},
  });
}

/**
 * Combined: notify users + add activity entry.
 * Common pattern for project events.
 */
export async function notifyAndLog(params: {
  projectId: string;
  notifyUserIds: string[];
  notificationType: NotificationType;
  activityType: ActivityType;
  title: string;
  body?: string;
  link?: string;
  actorUserId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await Promise.all([
    notifyMany(params.notifyUserIds, {
      type: params.notificationType,
      title: params.title,
      body: params.body,
      link: params.link,
      projectId: params.projectId,
    }),
    postActivity({
      projectId: params.projectId,
      userId: params.actorUserId,
      type: params.activityType,
      title: params.title,
      body: params.body,
      metadata: params.metadata,
    }),
  ]);
}

/**
 * Get stakeholder user IDs for a project (client users + assigned PM).
 * Used to determine who to notify about project events.
 */
export async function getProjectStakeholders(projectId: string): Promise<string[]> {
  const project = await db('projects').where({ id: projectId }).first();
  if (!project) return [];

  const stakeholderIds: string[] = [];

  // Add PM if assigned
  if (project.pm_user_id) {
    stakeholderIds.push(project.pm_user_id);
  }

  // Add client org members
  if (project.organization_id) {
    const clientUsers = await db('users')
      .where({ organization_id: project.organization_id, role: 'CLIENT', is_active: true })
      .select('id');
    stakeholderIds.push(...clientUsers.map((u: any) => u.id));
  }

  // Add assigned creatives
  const assignedCreatives = await db('project_phases')
    .where({ project_id: projectId })
    .whereNotNull('assigned_creative_id')
    .select('assigned_creative_id');

  for (const phase of assignedCreatives) {
    const profile = await db('creative_profiles')
      .where({ id: phase.assigned_creative_id })
      .first();
    if (profile) stakeholderIds.push(profile.user_id);
  }

  // Deduplicate
  return [...new Set(stakeholderIds)];
}
