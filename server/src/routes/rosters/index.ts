/**
 * /api/v1/rosters — Spec System 05
 * Roster management: create, save, add/remove members, cost calculation, re-roster.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { UserRole } from '../../types/index.js';

export const rostersRouter = Router();

rostersRouter.use(validateJwt, resolveUser);

const createRosterSchema = z.object({
  name: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
});

/**
 * POST /api/v1/rosters
 * Create a new roster for the client's organization.
 */
rostersRouter.post(
  '/',
  requireRole(UserRole.CLIENT),
  validate({ body: createRosterSchema }),
  async (req: Request, res: Response) => {
    const [roster] = await db('rosters')
      .insert({
        name: req.body.name,
        notes: req.body.notes,
        organization_id: req.user!.organizationId,
        created_by_user_id: req.user!.userId,
      })
      .returning('*');

    res.status(201).json({ data: roster });
  },
);

/**
 * GET /api/v1/rosters
 * List rosters for the client's organization.
 */
rostersRouter.get(
  '/',
  requireRole(UserRole.CLIENT, UserRole.PM),
  async (req: Request, res: Response) => {
    const orgId = req.user!.role === UserRole.PM
      ? req.query.organization_id as string
      : req.user!.organizationId;

    if (!orgId) {
      res.status(400).json({ data: null, errors: [{ code: 'MISSING_ORG', message: 'Organization ID required' }] });
      return;
    }

    const rosters = await db('rosters')
      .where({ organization_id: orgId })
      .orderBy('updated_at', 'desc');

    // Attach member counts
    const rosterIds = rosters.map((r: any) => r.id);
    const memberCounts = await db('roster_members')
      .whereIn('roster_id', rosterIds)
      .where('is_backup', false)
      .groupBy('roster_id')
      .select('roster_id')
      .count('* as member_count');

    const countMap = new Map(memberCounts.map((mc: any) => [mc.roster_id, Number(mc.member_count)]));
    const data = rosters.map((r: any) => ({
      ...r,
      member_count: countMap.get(r.id) || 0,
    }));

    res.json({ data });
  },
);

/**
 * GET /api/v1/rosters/:id
 * Get a roster with all members and cost calculation.
 */
rostersRouter.get('/:id', async (req: Request, res: Response) => {
  const roster = await db('rosters').where({ id: req.params.id }).first();
  if (!roster) {
    res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Roster not found' }] });
    return;
  }

  // Verify access
  if (req.user!.role === UserRole.CLIENT && roster.organization_id !== req.user!.organizationId) {
    res.status(403).json({ data: null, errors: [{ code: 'FORBIDDEN', message: 'Access denied' }] });
    return;
  }

  const members = await db('roster_members as rm')
    .join('creative_profiles as cp', 'cp.id', 'rm.creative_profile_id')
    .join('users as u', 'u.id', 'cp.user_id')
    .where('rm.roster_id', req.params.id)
    .select(
      'rm.id as membership_id', 'rm.role_label', 'rm.annotation', 'rm.is_backup', 'rm.added_at',
      'cp.id as creative_profile_id', 'cp.day_rate_cents', 'cp.rush_multiplier',
      'cp.tier', 'cp.availability_status', 'cp.average_rating',
      'u.first_name', 'u.last_name', 'u.avatar_url',
    );

  // Real-time cost calculation (Spec System 05)
  const primaryMembers = members.filter((m: any) => !m.is_backup);
  const totalDayRateCents = primaryMembers.reduce((sum: number, m: any) => sum + m.day_rate_cents, 0);

  res.json({
    data: {
      ...roster,
      members,
      cost_estimate: {
        total_day_rate_cents: totalDayRateCents,
        primary_member_count: primaryMembers.length,
        backup_count: members.length - primaryMembers.length,
      },
    },
  });
});

const addMemberSchema = z.object({
  creative_profile_id: z.string().uuid(),
  role_label: z.string().min(1).max(100),
  annotation: z.string().max(500).optional(),
  is_backup: z.boolean().default(false),
});

/**
 * POST /api/v1/rosters/:id/members
 * Add a creative to a roster.
 */
rostersRouter.post(
  '/:id/members',
  requireRole(UserRole.CLIENT),
  validate({ body: addMemberSchema }),
  async (req: Request, res: Response) => {
    const roster = await db('rosters').where({ id: req.params.id, organization_id: req.user!.organizationId }).first();
    if (!roster) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Roster not found' }] });
      return;
    }

    const [member] = await db('roster_members')
      .insert({
        roster_id: req.params.id,
        creative_profile_id: req.body.creative_profile_id,
        role_label: req.body.role_label,
        annotation: req.body.annotation,
        is_backup: req.body.is_backup,
      })
      .returning('*');

    res.status(201).json({ data: member });
  },
);

/**
 * DELETE /api/v1/rosters/:id/members/:memberId
 * Remove a creative from a roster.
 */
rostersRouter.delete(
  '/:id/members/:memberId',
  requireRole(UserRole.CLIENT),
  async (req: Request, res: Response) => {
    const deleted = await db('roster_members')
      .where({ id: req.params.memberId, roster_id: req.params.id })
      .del();

    if (!deleted) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Member not found' }] });
      return;
    }

    res.json({ data: { deleted: true } });
  },
);

/**
 * PATCH /api/v1/rosters/:id/save
 * Save/finalize a roster.
 */
rostersRouter.patch(
  '/:id/save',
  requireRole(UserRole.CLIENT),
  async (req: Request, res: Response) => {
    const [roster] = await db('rosters')
      .where({ id: req.params.id, organization_id: req.user!.organizationId })
      .update({ is_saved: true, updated_at: new Date() })
      .returning('*');

    if (!roster) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Roster not found' }] });
      return;
    }

    res.json({ data: roster });
  },
);
