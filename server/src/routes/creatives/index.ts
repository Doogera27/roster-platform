/**
 * /api/v1/creatives — Spec Systems 02 & 04
 * Creative profiles: search, filter, individual profile, portfolio, availability.
 * Also handles the creative application and vetting workflow.
 *
 * IMPORTANT: Express matches routes in registration order.
 * All fixed-string GET routes (/favorites, /applications) MUST be
 * registered BEFORE the parameterised GET /:id route.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { UserRole, ApplicationStatus, AvailabilityStatus } from '../../types/index.js';

export const creativesRouter = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const searchQuerySchema = z.object({
  q: z.string().optional(),
  disciplines: z.string().optional(),          // comma-separated
  availability: z.enum(['AVAILABLE', 'LIMITED', 'UNAVAILABLE']).optional(),
  experience_level: z.enum(['JUNIOR', 'MID', 'SENIOR', 'EXPERT']).optional(),
  tier: z.enum(['MEMBER', 'PRO', 'ELITE']).optional(),
  min_day_rate: z.coerce.number().optional(),
  max_day_rate: z.coerce.number().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const updateProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  disciplines: z.array(z.string()).optional(),
  experience_level: z.enum(['JUNIOR', 'MID', 'SENIOR', 'EXPERT']).optional(),
  day_rate_cents: z.number().int().min(0).optional(),
  rush_multiplier: z.number().min(1).max(5).optional(),
  revision_policy: z.string().max(1000).optional(),
  cancellation_terms: z.string().max(1000).optional(),
  licensing_tiers: z.record(z.unknown()).optional(),
  availability_status: z.enum(['AVAILABLE', 'LIMITED', 'UNAVAILABLE']).optional(),
  max_concurrent_projects: z.number().int().min(1).max(20).optional(),
});

const applicationSchema = z.object({
  bio: z.string().min(50).max(2000),
  disciplines: z.array(z.string()).min(1),
  experience_level: z.enum(['JUNIOR', 'MID', 'SENIOR', 'EXPERT']),
  day_rate_cents: z.number().int().min(0),
  portfolio_urls: z.array(z.string().url()).min(1).max(20),
  statement: z.string().min(100).max(5000),
});

const vetSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().max(2000).optional(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  GET routes with fixed paths — MUST come before /:id
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/v1/creatives
 * Search and filter approved creatives. Spec System 04.
 */
creativesRouter.get(
  '/',
  validateJwt,
  resolveUser,
  validate({ query: searchQuerySchema }),
  async (req: Request, res: Response) => {
    const { q, disciplines, availability, experience_level, tier, min_day_rate, max_day_rate, cursor, limit } = req.query as any;

    let query = db('creative_profiles as cp')
      .join('users as u', 'u.id', 'cp.user_id')
      .where('cp.application_status', ApplicationStatus.APPROVED)
      .where('u.is_active', true)
      .select(
        'cp.id', 'cp.user_id', 'u.first_name', 'u.last_name', 'u.avatar_url',
        'cp.bio', 'cp.disciplines', 'cp.experience_level', 'cp.day_rate_cents',
        'cp.availability_status', 'cp.tier', 'cp.is_charter_member',
        'cp.projects_completed', 'cp.average_rating', 'cp.created_at',
      );

    // Full-text search (basic — Elasticsearch replaces this in production)
    if (q) {
      query = query.where(function () {
        this.whereILike('u.first_name', `%${q}%`)
          .orWhereILike('u.last_name', `%${q}%`)
          .orWhereILike('cp.bio', `%${q}%`);
      });
    }

    // Discipline filter (PostgreSQL array overlap)
    if (disciplines) {
      const arr = (disciplines as string).split(',').map((d: string) => d.trim());
      query = query.whereRaw('cp.disciplines && ?', [arr]);
    }

    if (availability) query = query.where('cp.availability_status', availability);
    if (experience_level) query = query.where('cp.experience_level', experience_level);
    if (tier) query = query.where('cp.tier', tier);
    if (min_day_rate) query = query.where('cp.day_rate_cents', '>=', Number(min_day_rate));
    if (max_day_rate) query = query.where('cp.day_rate_cents', '<=', Number(max_day_rate));

    // Cursor-based pagination (Spec Section 8.2)
    if (cursor) {
      query = query.where('cp.id', '>', cursor);
    }

    query = query
      .orderByRaw('cp.availability_status = \'AVAILABLE\' DESC')
      .orderBy('cp.tier', 'desc')
      .orderBy('cp.average_rating', 'desc')
      .limit(Number(limit) + 1); // fetch one extra to detect has_more

    const results = await query;
    const hasMore = results.length > Number(limit);
    if (hasMore) results.pop();

    res.json({
      data: results,
      meta: {
        cursor: results.length > 0 ? results[results.length - 1].id : undefined,
        has_more: hasMore,
      },
    });
  },
);

/**
 * GET /api/v1/creatives/favorites
 * List client's saved/favorited creatives (Phase 4.3).
 */
creativesRouter.get(
  '/favorites',
  validateJwt,
  resolveUser,
  requireRole(UserRole.CLIENT),
  async (req: Request, res: Response) => {
    if (!req.user!.organizationId) {
      res.json({ data: [] });
      return;
    }

    const favorites = await db('favorite_creatives as fc')
      .join('creative_profiles as cp', 'cp.id', 'fc.creative_profile_id')
      .join('users as u', 'u.id', 'cp.user_id')
      .where('fc.organization_id', req.user!.organizationId)
      .select(
        'fc.id as favorite_id', 'fc.notes', 'fc.created_at as favorited_at',
        'cp.id', 'cp.user_id', 'u.first_name', 'u.last_name', 'u.avatar_url',
        'cp.bio', 'cp.disciplines', 'cp.experience_level', 'cp.day_rate_cents',
        'cp.availability_status', 'cp.tier', 'cp.projects_completed', 'cp.average_rating',
      )
      .orderBy('fc.created_at', 'desc');

    res.json({ data: favorites });
  },
);

/**
 * GET /api/v1/creatives/applications
 * List pending creative applications (PM only). Phase 4.4.
 */
creativesRouter.get(
  '/applications',
  validateJwt,
  resolveUser,
  requireRole(UserRole.PM),
  async (req: Request, res: Response) => {
    const status = (req.query.status as string) || 'UNDER_REVIEW';
    const applications = await db('creative_profiles as cp')
      .join('users as u', 'u.id', 'cp.user_id')
      .where('cp.application_status', status)
      .select(
        'cp.*', 'u.first_name', 'u.last_name', 'u.email', 'u.avatar_url',
      )
      .orderBy('cp.updated_at', 'desc');

    res.json({ data: applications });
  },
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Parameterised routes — /:id comes AFTER fixed paths
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/v1/creatives/:id
 * Individual creative profile with portfolio.
 */
creativesRouter.get(
  '/:id',
  validateJwt,
  resolveUser,
  async (req: Request, res: Response) => {
    const profile = await db('creative_profiles as cp')
      .join('users as u', 'u.id', 'cp.user_id')
      .where('cp.id', req.params.id)
      .where('cp.application_status', ApplicationStatus.APPROVED)
      .select('cp.*', 'u.first_name', 'u.last_name', 'u.avatar_url', 'u.email')
      .first();

    if (!profile) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Creative not found' }] });
      return;
    }

    const portfolio = await db('portfolio_assets')
      .where({ creative_profile_id: profile.id })
      .orderBy('sort_order');

    res.json({ data: { ...profile, portfolio } });
  },
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Authenticated creative self-management routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * PATCH /api/v1/creatives/me/profile
 * Creative updates their own profile. Spec System 02.
 */
creativesRouter.patch(
  '/me/profile',
  validateJwt,
  resolveUser,
  requireRole(UserRole.CREATIVE),
  validate({ body: updateProfileSchema }),
  async (req: Request, res: Response) => {
    const [updated] = await db('creative_profiles')
      .where({ user_id: req.user!.userId })
      .update({ ...req.body, updated_at: new Date() })
      .returning('*');

    res.json({ data: updated });
  },
);

/**
 * POST /api/v1/creatives/me/apply
 * Submit creative application for vetting. Spec System 02.
 */
creativesRouter.post(
  '/me/apply',
  validateJwt,
  resolveUser,
  requireRole(UserRole.CREATIVE),
  validate({ body: applicationSchema }),
  async (req: Request, res: Response) => {
    const profile = await db('creative_profiles').where({ user_id: req.user!.userId }).first();

    if (profile.application_status !== ApplicationStatus.APPLIED) {
      res.status(400).json({
        data: null,
        errors: [{ code: 'ALREADY_APPLIED', message: `Application status is already: ${profile.application_status}` }],
      });
      return;
    }

    const { statement, ...profileData } = req.body;

    const [updated] = await db('creative_profiles')
      .where({ user_id: req.user!.userId })
      .update({
        ...profileData,
        application_status: ApplicationStatus.UNDER_REVIEW,
        application_notes: statement,
        updated_at: new Date(),
      })
      .returning('*');

    res.json({ data: updated });
  },
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Favorites mutations — /:id/favorite
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/v1/creatives/:id/favorite
 * Save a creative as a favorite.
 */
creativesRouter.post(
  '/:id/favorite',
  validateJwt,
  resolveUser,
  requireRole(UserRole.CLIENT),
  async (req: Request, res: Response) => {
    if (!req.user!.organizationId) {
      res.status(400).json({ data: null, errors: [{ code: 'NO_ORG', message: 'No organization' }] });
      return;
    }

    try {
      const [fav] = await db('favorite_creatives')
        .insert({
          organization_id: req.user!.organizationId,
          creative_profile_id: req.params.id,
          added_by_user_id: req.user!.userId,
          notes: req.body?.notes || null,
        })
        .returning('*');

      res.status(201).json({ data: fav });
    } catch (err: any) {
      if (err.code === '23505') {
        res.status(409).json({ data: null, errors: [{ code: 'DUPLICATE', message: 'Already favorited' }] });
      } else {
        throw err;
      }
    }
  },
);

/**
 * DELETE /api/v1/creatives/:id/favorite
 * Remove a creative from favorites.
 */
creativesRouter.delete(
  '/:id/favorite',
  validateJwt,
  resolveUser,
  requireRole(UserRole.CLIENT),
  async (req: Request, res: Response) => {
    const deleted = await db('favorite_creatives')
      .where({
        organization_id: req.user!.organizationId,
        creative_profile_id: req.params.id,
      })
      .del();

    if (deleted === 0) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Favorite not found' }] });
      return;
    }

    res.json({ data: { deleted: true } });
  },
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Vetting / Application Management (Phase 4.4)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * PATCH /api/v1/creatives/:id/vet
 * Approve or reject a creative application (PM only).
 */
creativesRouter.patch(
  '/:id/vet',
  validateJwt,
  resolveUser,
  requireRole(UserRole.PM),
  validate({ body: vetSchema }),
  async (req: Request, res: Response) => {
    const newStatus = req.body.action === 'APPROVE'
      ? ApplicationStatus.APPROVED
      : ApplicationStatus.REJECTED;

    const [updated] = await db('creative_profiles')
      .where({ id: req.params.id, application_status: ApplicationStatus.UNDER_REVIEW })
      .update({
        application_status: newStatus,
        application_notes: req.body.notes || null,
        updated_at: new Date(),
      })
      .returning('*');

    if (!updated) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Application not found or already processed' }] });
      return;
    }

    // Notify the creative
    const user = await db('users').where({ id: updated.user_id }).first();
    if (user) {
      const { notify: notifyFn } = await import('../../services/notifications.js');
      await notifyFn({
        userId: user.id,
        type: 'general',
        title: req.body.action === 'APPROVE'
          ? 'Your application has been approved!'
          : 'Application update',
        body: req.body.action === 'APPROVE'
          ? 'Welcome to the Roster network. You can now be added to project rosters.'
          : `Your application requires updates. ${req.body.notes || ''}`,
      });
    }

    res.json({ data: updated });
  },
);
