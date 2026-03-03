/**
 * /api/v1/projects — Spec Systems 06 & 07
 * Project lifecycle: create, brief, initialize, status, close.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { UserRole, ProjectStatus, PhaseStatus, ProjectType } from '../../types/index.js';
import { reflectOnBrief, suggestTimeline, scorePMCandidates } from '../../services/ai.js';
import { recordSpending, getBudgetSummary } from '../../services/budget.js';
import { notifyAndLog, getProjectStakeholders } from '../../services/notifications.js';

export const projectsRouter = Router();

projectsRouter.use(validateJwt, resolveUser);

const createProjectSchema = z.object({
  name: z.string().min(1).max(300),
  project_type: z.nativeEnum(ProjectType),
  roster_id: z.string().uuid(),
  brief: z.string().min(10),
  budget_cents: z.number().int().min(0),
  due_date: z.string().optional(), // ISO date string
});

/**
 * POST /api/v1/projects
 * Create a new project from a brief and roster. Spec System 06.
 * Creates as DRAFT — client must confirm after AI reflection.
 */
projectsRouter.post(
  '/',
  requireRole(UserRole.CLIENT),
  validate({ body: createProjectSchema }),
  async (req: Request, res: Response) => {
    // Verify roster belongs to client's org
    const roster = await db('rosters')
      .where({ id: req.body.roster_id, organization_id: req.user!.organizationId })
      .first();

    if (!roster) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Roster not found' }] });
      return;
    }

    const [project] = await db('projects')
      .insert({
        organization_id: req.user!.organizationId,
        roster_id: req.body.roster_id,
        project_type: req.body.project_type,
        name: req.body.name,
        brief: req.body.brief,
        budget_cents: req.body.budget_cents,
        due_date: req.body.due_date || null,
        status: ProjectStatus.DRAFT,
      })
      .returning('*');

    res.status(201).json({ data: project });
  },
);

/**
 * GET /api/v1/projects
 * List projects for the client's organization.
 */
projectsRouter.get('/', async (req: Request, res: Response) => {
  let orgId: string | null;

  if (req.user!.role === UserRole.PM) {
    orgId = req.query.organization_id as string || null;
    // PM can list all projects if no org filter
  } else if (req.user!.role === UserRole.CREATIVE) {
    // Creative sees projects they're assigned to
    const assignedProjects = await db('project_phases')
      .join('projects', 'projects.id', 'project_phases.project_id')
      .join('creative_profiles', 'creative_profiles.id', 'project_phases.assigned_creative_id')
      .where('creative_profiles.user_id', req.user!.userId)
      .select('projects.*')
      .distinct('projects.id');

    res.json({ data: assignedProjects });
    return;
  } else {
    orgId = req.user!.organizationId;
  }

  let query = db('projects').orderBy('created_at', 'desc');
  if (orgId) query = query.where({ organization_id: orgId });

  const status = req.query.status as string;
  if (status) query = query.where({ status });

  const projects = await query;
  res.json({ data: projects });
});

// ─── Workflow Templates (Phase 5.1) ──────────────────────

/**
 * GET /api/v1/projects/templates
 * List all active workflow templates.
 * Must be registered BEFORE /:id to avoid Express param matching.
 */
projectsRouter.get('/templates', async (_req: Request, res: Response) => {
  const templates = await db('workflow_templates')
    .where({ is_active: true })
    .orderBy('project_type');
  res.json({ data: templates });
});

/**
 * GET /api/v1/projects/templates/:projectType
 * Get workflow template for a specific project type.
 */
projectsRouter.get('/templates/:projectType', async (req: Request, res: Response) => {
  const template = await db('workflow_templates')
    .where({ project_type: req.params.projectType, is_active: true })
    .first();

  if (!template) {
    res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'No template for this project type' }] });
    return;
  }

  res.json({ data: template });
});

/**
 * POST /api/v1/projects/:id/apply-template
 * Apply a workflow template's phases to an existing project.
 * Creates project_phases from the template's phase definitions.
 */
projectsRouter.post(
  '/:id/apply-template',
  requireRole(UserRole.CLIENT, UserRole.PM),
  async (req: Request, res: Response) => {
    const projectId = req.params.id as string;
    const project = await db('projects').where({ id: projectId }).first();
    if (!project) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Project not found' }] });
      return;
    }

    const template = await db('workflow_templates')
      .where({ project_type: project.project_type, is_active: true })
      .first();

    if (!template) {
      res.status(404).json({ data: null, errors: [{ code: 'NO_TEMPLATE', message: 'No template for this project type' }] });
      return;
    }

    // Delete existing phases if any
    await db('project_phases').where({ project_id: projectId }).del();

    // Create phases from template
    const phases = (template.phases as any[]).map((phase: any, idx: number) => ({
      project_id: projectId,
      name: phase.name,
      description: phase.description || '',
      depends_on: phase.depends_on || [],
      status: idx === 0 ? PhaseStatus.PENDING : PhaseStatus.PENDING,
      typical_duration_days: phase.typical_duration_days || 7,
      sort_order: phase.sort_order ?? idx + 1,
    }));

    const createdPhases = await db('project_phases').insert(phases).returning('*');

    res.json({ data: { template: template.name, phases: createdPhases } });
  },
);

/**
 * GET /api/v1/projects/:id
 * Get full project details including phases.
 */
projectsRouter.get('/:id', async (req: Request, res: Response) => {
  const project = await db('projects').where({ id: req.params.id }).first();
  if (!project) {
    res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Project not found' }] });
    return;
  }

  const phases = await db('project_phases')
    .where({ project_id: project.id })
    .orderBy('sort_order');

  const roster = await db('rosters').where({ id: project.roster_id }).first();

  res.json({ data: { ...project, phases, roster } });
});

/**
 * POST /api/v1/projects/:id/initialize
 * Initialize a draft project — creates phases from workflow template. Spec System 06.
 * This is called after the client confirms the AI brief reflection.
 */
projectsRouter.post(
  '/:id/initialize',
  requireRole(UserRole.CLIENT, UserRole.PM),
  async (req: Request, res: Response) => {
    const project = await db('projects').where({ id: req.params.id }).first();
    if (!project || project.status !== ProjectStatus.DRAFT) {
      res.status(400).json({
        data: null,
        errors: [{ code: 'INVALID_STATE', message: 'Project must be in DRAFT status to initialize' }],
      });
      return;
    }

    // Load workflow template
    const template = await db('workflow_templates')
      .where({ project_type: project.project_type, is_active: true })
      .first();

    if (!template) {
      res.status(400).json({
        data: null,
        errors: [{ code: 'NO_TEMPLATE', message: `No workflow template for project type: ${project.project_type}` }],
      });
      return;
    }

    const trx = await db.transaction();
    try {
      // Create phases from template (Spec Section 3.2 — DAG)
      const templatePhases = template.phases as Array<{
        name: string;
        description: string;
        typical_duration_days: number;
        required_roles: string[];
        depends_on: number[];  // indices into template phases array
        deliverables: string[];
      }>;

      const phaseIds: string[] = [];

      for (let i = 0; i < templatePhases.length; i++) {
        const tp = templatePhases[i];
        const dependsOnIds = tp.depends_on.map((idx) => phaseIds[idx]).filter(Boolean);

        const [phase] = await trx('project_phases')
          .insert({
            project_id: project.id,
            name: tp.name,
            description: tp.description,
            depends_on: dependsOnIds,
            status: dependsOnIds.length === 0 ? PhaseStatus.ACTIVE : PhaseStatus.PENDING,
            typical_duration_days: tp.typical_duration_days,
            sort_order: i,
            activated_at: dependsOnIds.length === 0 ? new Date() : null,
          })
          .returning('*');

        phaseIds.push(phase.id);
      }

      // Update project status
      await trx('projects')
        .where({ id: project.id })
        .update({
          status: ProjectStatus.ACTIVE,
          started_at: new Date(),
          updated_at: new Date(),
        });

      await trx.commit();

      const updatedProject = await db('projects').where({ id: project.id }).first();
      const phases = await db('project_phases')
        .where({ project_id: project.id })
        .orderBy('sort_order');

      res.json({ data: { ...updatedProject, phases } });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },
);

/**
 * PATCH /api/v1/projects/:id/status
 * Update project status (PM only for most transitions).
 */
const updateStatusSchema = z.object({
  status: z.nativeEnum(ProjectStatus),
});

projectsRouter.patch(
  '/:id/status',
  requireRole(UserRole.PM, UserRole.CLIENT),
  validate({ body: updateStatusSchema }),
  async (req: Request, res: Response) => {
    const [updated] = await db('projects')
      .where({ id: req.params.id })
      .update({
        status: req.body.status,
        completed_at: req.body.status === ProjectStatus.COMPLETED ? new Date() : undefined,
        updated_at: new Date(),
      })
      .returning('*');

    if (!updated) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Project not found' }] });
      return;
    }

    res.json({ data: updated });
  },
);

/**
 * POST /api/v1/projects/:id/ai/reflect
 * Run AI brief reflection on a draft project. Spec System 04.
 * Returns structured analysis: summary, deliverables, ambiguities, timeline.
 */
projectsRouter.post(
  '/:id/ai/reflect',
  requireRole(UserRole.CLIENT, UserRole.PM),
  async (req: Request, res: Response) => {
    const project = await db('projects').where({ id: req.params.id }).first();
    if (!project) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Project not found' }] });
      return;
    }

    // Optionally load brand vault data for context
    let brandData: Record<string, unknown> | undefined;
    if (project.organization_id) {
      const vault = await db('brand_vaults').where({ organization_id: project.organization_id }).first();
      if (vault) {
        const assets = await db('brand_vault_assets')
          .where({ vault_id: vault.id })
          .select('filename', 'file_type', 'extracted_brand_data');
        brandData = {
          asset_count: assets.length,
          categories: [...new Set(assets.map((a: any) => a.file_type))],
          extracted_data: assets
            .filter((a: any) => a.extracted_brand_data)
            .map((a: any) => a.extracted_brand_data),
        };
      }
    }

    try {
      const reflection = await reflectOnBrief({
        projectId: project.id,
        projectType: project.project_type,
        brief: project.brief,
        brandData,
        budgetCents: project.budget_cents,
      });

      res.json({ data: reflection });
    } catch (err: any) {
      res.status(500).json({
        data: null,
        errors: [{ code: 'AI_ERROR', message: err.message || 'AI reflection failed' }],
      });
    }
  },
);

/**
 * POST /api/v1/projects/:id/ai/timeline
 * Run AI timeline suggestion on a project with phases. Spec System 04.
 */
projectsRouter.post(
  '/:id/ai/timeline',
  requireRole(UserRole.CLIENT, UserRole.PM),
  async (req: Request, res: Response) => {
    const project = await db('projects').where({ id: req.params.id }).first();
    if (!project) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Project not found' }] });
      return;
    }

    // Get phases (either from project or from workflow template)
    let phases = await db('project_phases')
      .where({ project_id: project.id })
      .orderBy('sort_order');

    // If no phases yet (project is DRAFT), load from template
    if (phases.length === 0) {
      const template = await db('workflow_templates')
        .where({ project_type: project.project_type, is_active: true })
        .first();
      if (template && template.phases) {
        phases = (template.phases as any[]).map((p: any, i: number) => ({
          name: p.name,
          description: p.description,
          typical_duration_days: p.typical_duration_days,
          sort_order: i,
        }));
      }
    }

    try {
      const timeline = await suggestTimeline({
        projectId: project.id,
        projectType: project.project_type,
        brief: project.brief,
        phases: phases.map((p: any) => ({
          name: p.name,
          description: p.description || '',
          typical_duration_days: p.typical_duration_days || 5,
        })),
        budgetCents: project.budget_cents,
      });

      res.json({ data: timeline });
    } catch (err: any) {
      res.status(500).json({
        data: null,
        errors: [{ code: 'AI_ERROR', message: err.message || 'Timeline suggestion failed' }],
      });
    }
  },
);

/**
 * POST /api/v1/projects/:id/ai/assign-pm
 * AI-scored PM auto-assignment. Finds best PM and optionally assigns.
 */
projectsRouter.post(
  '/:id/ai/assign-pm',
  requireRole(UserRole.PM, UserRole.CLIENT),
  async (req: Request, res: Response) => {
    const project = await db('projects').where({ id: req.params.id }).first();
    if (!project) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Project not found' }] });
      return;
    }

    // Find all PM users
    const pmUsers = await db('users')
      .where({ role: 'PM', is_active: true })
      .select('id', 'first_name', 'last_name');

    if (pmUsers.length === 0) {
      res.json({ data: { candidates: [], message: 'No PM users available' } });
      return;
    }

    // Get workload and performance data
    const candidates = await Promise.all(
      pmUsers.map(async (pm: any) => {
        const activeCount = await db('projects')
          .where({ pm_user_id: pm.id })
          .whereIn('status', ['ACTIVE', 'PENDING_CONFIRMATION'])
          .count('id as count')
          .first();

        const completedCount = await db('projects')
          .where({ pm_user_id: pm.id, status: 'COMPLETED' })
          .count('id as count')
          .first();

        const avgRating = await db('ratings')
          .where({ reviewed_user_id: pm.id })
          .avg('score as avg')
          .first();

        return {
          user_id: pm.id,
          name: `${pm.first_name} ${pm.last_name}`,
          active_project_count: Number(activeCount?.count || 0),
          completed_project_count: Number(completedCount?.count || 0),
          avg_rating: Number(avgRating?.avg || 4.0),
          specialties: [] as string[], // TODO: Add PM specialty tracking
        };
      })
    );

    try {
      const scores = await scorePMCandidates({
        projectType: project.project_type,
        brief: project.brief,
        candidates,
      });

      // Auto-assign if requested
      const autoAssign = req.body?.auto_assign === true;
      if (autoAssign && scores.length > 0) {
        await db('projects')
          .where({ id: project.id })
          .update({ pm_user_id: scores[0].user_id, updated_at: new Date() });
      }

      res.json({
        data: {
          candidates: scores,
          assigned: autoAssign && scores.length > 0 ? scores[0] : null,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        data: null,
        errors: [{ code: 'AI_ERROR', message: err.message || 'PM scoring failed' }],
      });
    }
  },
);

// ─── Budget Endpoints (Phase 3.2) ──────────────────────

/**
 * GET /api/v1/projects/:id/budget
 * Get budget summary for a project.
 */
projectsRouter.get('/:id/budget', async (req: Request, res: Response) => {
  const summary = await getBudgetSummary(req.params.id as string);
  if (!summary) {
    res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Project not found' }] });
    return;
  }
  res.json({ data: summary });
});

/**
 * POST /api/v1/projects/:id/budget/spend
 * Record spending against a project (PM only).
 */
const spendSchema = z.object({
  amount_cents: z.number().int().min(1),
  description: z.string().min(1).max(500),
});

projectsRouter.post(
  '/:id/budget/spend',
  requireRole(UserRole.PM),
  validate({ body: spendSchema }),
  async (req: Request, res: Response) => {
    try {
      const result = await recordSpending({
        projectId: req.params.id as string,
        amountCents: req.body.amount_cents,
        description: req.body.description,
        userId: req.user!.userId,
      });
      res.json({ data: result });
    } catch (err: any) {
      res.status(400).json({
        data: null,
        errors: [{ code: 'BUDGET_ERROR', message: err.message }],
      });
    }
  },
);

// ─── Change Orders (Phase 3.3) ──────────────────────────

const createChangeOrderSchema = z.object({
  type: z.enum(['SCOPE_CHANGE', 'BUDGET_INCREASE', 'TIMELINE_EXTENSION', 'RESOURCE_CHANGE']),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  amount_cents: z.number().int().default(0),
  timeline_impact_days: z.number().int().default(0),
});

/**
 * POST /api/v1/projects/:id/change-orders
 * Submit a change order for a project.
 */
projectsRouter.post(
  '/:id/change-orders',
  requireRole(UserRole.CLIENT, UserRole.PM),
  validate({ body: createChangeOrderSchema }),
  async (req: Request, res: Response) => {
    const project = await db('projects').where({ id: req.params.id }).first();
    if (!project) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Project not found' }] });
      return;
    }

    const [order] = await db('change_orders')
      .insert({
        project_id: req.params.id,
        requested_by_user_id: req.user!.userId,
        type: req.body.type,
        title: req.body.title,
        description: req.body.description || null,
        amount_cents: req.body.amount_cents || 0,
        timeline_impact_days: req.body.timeline_impact_days || 0,
        status: 'PENDING',
      })
      .returning('*');

    // Notify stakeholders
    const stakeholders = await getProjectStakeholders(req.params.id as string);
    await notifyAndLog({
      projectId: req.params.id as string,
      notifyUserIds: stakeholders.filter(id => id !== req.user!.userId),
      notificationType: 'general',
      activityType: 'budget_update',
      title: `Change order submitted: ${req.body.title}`,
      body: req.body.description || undefined,
      link: `/projects/${req.params.id}`,
      actorUserId: req.user!.userId,
    });

    res.status(201).json({ data: order });
  },
);

/**
 * GET /api/v1/projects/:id/change-orders
 * List change orders for a project.
 */
projectsRouter.get('/:id/change-orders', async (req: Request, res: Response) => {
  const orders = await db('change_orders')
    .where({ project_id: req.params.id })
    .orderBy('created_at', 'desc');
  res.json({ data: orders });
});

/**
 * PATCH /api/v1/projects/:id/change-orders/:orderId/approve
 * Approve a change order (PM or CLIENT depending on who requested).
 */
projectsRouter.patch(
  '/:id/change-orders/:orderId/approve',
  requireRole(UserRole.PM, UserRole.CLIENT),
  async (req: Request, res: Response) => {
    const [order] = await db('change_orders')
      .where({ id: req.params.orderId, project_id: req.params.id, status: 'PENDING' })
      .update({
        status: 'APPROVED',
        approved_by_user_id: req.user!.userId,
        approved_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    if (!order) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Change order not found or already processed' }] });
      return;
    }

    // Apply budget change if approved
    if (order.amount_cents > 0) {
      await db('projects')
        .where({ id: req.params.id })
        .increment('budget_cents', order.amount_cents)
        .update({ updated_at: new Date() });
    }

    res.json({ data: order });
  },
);

/**
 * PATCH /api/v1/projects/:id/change-orders/:orderId/reject
 * Reject a change order.
 */
projectsRouter.patch(
  '/:id/change-orders/:orderId/reject',
  requireRole(UserRole.PM, UserRole.CLIENT),
  async (req: Request, res: Response) => {
    const [order] = await db('change_orders')
      .where({ id: req.params.orderId, project_id: req.params.id, status: 'PENDING' })
      .update({
        status: 'REJECTED',
        approved_by_user_id: req.user!.userId,
        updated_at: new Date(),
      })
      .returning('*');

    if (!order) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Change order not found or already processed' }] });
      return;
    }

    res.json({ data: order });
  },
);
