/**
 * /api/v1/admin — Spec System 01 & 02
 * Internal PM routes: vetting queue, application management, PM dashboard.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { UserRole, ApplicationStatus } from '../../types/index.js';

export const adminRouter = Router();

adminRouter.use(validateJwt, resolveUser, requireRole(UserRole.PM));

/**
 * GET /api/v1/admin/vetting-queue
 * List creative applications pending review. Spec System 02.
 */
adminRouter.get('/vetting-queue', async (_req: Request, res: Response) => {
  const applications = await db('creative_profiles as cp')
    .join('users as u', 'u.id', 'cp.user_id')
    .where('cp.application_status', ApplicationStatus.UNDER_REVIEW)
    .select(
      'cp.id', 'cp.user_id', 'cp.bio', 'cp.disciplines', 'cp.experience_level',
      'cp.day_rate_cents', 'cp.portfolio_urls', 'cp.application_notes',
      'cp.application_status', 'cp.created_at',
      'u.first_name', 'u.last_name', 'u.email',
    )
    .orderBy('cp.created_at', 'asc');

  res.json({ data: applications });
});

/**
 * PATCH /api/v1/admin/vetting/:creativeProfileId/approve
 * Approve a creative application.
 */
adminRouter.patch(
  '/vetting/:creativeProfileId/approve',
  async (req: Request, res: Response) => {
    const [profile] = await db('creative_profiles')
      .where({ id: req.params.creativeProfileId, application_status: ApplicationStatus.UNDER_REVIEW })
      .update({
        application_status: ApplicationStatus.APPROVED,
        updated_at: new Date(),
      })
      .returning('*');

    if (!profile) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Application not found or not in review' }] });
      return;
    }

    res.json({ data: profile });
  },
);

/**
 * PATCH /api/v1/admin/vetting/:creativeProfileId/reject
 * Reject a creative application with reason.
 */
const rejectSchema = z.object({
  reason: z.string().min(1).max(2000),
});

adminRouter.patch(
  '/vetting/:creativeProfileId/reject',
  validate({ body: rejectSchema }),
  async (req: Request, res: Response) => {
    const [profile] = await db('creative_profiles')
      .where({ id: req.params.creativeProfileId, application_status: ApplicationStatus.UNDER_REVIEW })
      .update({
        application_status: ApplicationStatus.REJECTED,
        application_notes: req.body.reason,
        updated_at: new Date(),
      })
      .returning('*');

    if (!profile) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Application not found or not in review' }] });
      return;
    }

    res.json({ data: profile });
  },
);

/**
 * GET /api/v1/admin/dashboard
 * PM operational dashboard — key metrics. Spec System 10.
 */
adminRouter.get('/dashboard', async (_req: Request, res: Response) => {
  const [
    activeProjects,
    pendingApplications,
    activeCreatives,
    recentEscalations,
  ] = await Promise.all([
    db('projects').where({ status: 'ACTIVE' }).count('id as count').first(),
    db('creative_profiles').where({ application_status: 'UNDER_REVIEW' }).count('id as count').first(),
    db('creative_profiles').where({ application_status: 'APPROVED', availability_status: 'AVAILABLE' }).count('id as count').first(),
    db('projects').where({ health: 'RED' }).count('id as count').first(),
  ]);

  res.json({
    data: {
      active_projects: Number(activeProjects?.count || 0),
      pending_applications: Number(pendingApplications?.count || 0),
      active_creatives: Number(activeCreatives?.count || 0),
      at_risk_projects: Number(recentEscalations?.count || 0),
    },
  });
});
