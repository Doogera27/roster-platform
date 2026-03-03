/**
 * /api/v1/ratings — Spec System 11
 * Post-project ratings and reviews.
 * Clients rate creatives, creatives rate clients, PM rates both.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { UserRole } from '../../types/index.js';

export const ratingsRouter = Router();

ratingsRouter.use(validateJwt, resolveUser);

const createRatingSchema = z.object({
  project_id: z.string().uuid(),
  reviewed_user_id: z.string().uuid(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

/**
 * POST /api/v1/ratings
 * Submit a rating for a user after a project.
 */
ratingsRouter.post(
  '/',
  validate({ body: createRatingSchema }),
  async (req: Request, res: Response) => {
    // Prevent self-rating
    if (req.user!.userId === req.body.reviewed_user_id) {
      res.status(400).json({ data: null, errors: [{ code: 'SELF_RATING', message: 'Cannot rate yourself' }] });
      return;
    }

    // Check project exists
    const project = await db('projects').where({ id: req.body.project_id }).first();
    if (!project) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Project not found' }] });
      return;
    }

    // Check for duplicate rating
    const existing = await db('ratings')
      .where({
        project_id: req.body.project_id,
        reviewer_user_id: req.user!.userId,
        reviewed_user_id: req.body.reviewed_user_id,
      })
      .first();

    if (existing) {
      res.status(409).json({ data: null, errors: [{ code: 'DUPLICATE', message: 'You have already rated this user for this project' }] });
      return;
    }

    const [rating] = await db('ratings')
      .insert({
        project_id: req.body.project_id,
        reviewer_user_id: req.user!.userId,
        reviewed_user_id: req.body.reviewed_user_id,
        score: req.body.score,
        comment: req.body.comment || null,
      })
      .returning('*');

    // Update the creative's average rating if they have a profile
    const profile = await db('creative_profiles')
      .where({ user_id: req.body.reviewed_user_id })
      .first();

    if (profile) {
      const avgResult = await db('ratings')
        .where({ reviewed_user_id: req.body.reviewed_user_id })
        .avg('score as avg')
        .first();

      await db('creative_profiles')
        .where({ user_id: req.body.reviewed_user_id })
        .update({ average_rating: Number(avgResult?.avg || 0) });
    }

    res.status(201).json({ data: rating });
  },
);

/**
 * GET /api/v1/ratings/user/:userId
 * Get ratings received by a specific user.
 */
ratingsRouter.get('/user/:userId', async (req: Request, res: Response) => {
  const ratings = await db('ratings')
    .leftJoin('users', 'ratings.reviewer_user_id', 'users.id')
    .leftJoin('projects', 'ratings.project_id', 'projects.id')
    .where({ 'ratings.reviewed_user_id': req.params.userId })
    .select(
      'ratings.*',
      'users.first_name as reviewer_first_name',
      'users.last_name as reviewer_last_name',
      'projects.name as project_name',
    )
    .orderBy('ratings.created_at', 'desc');

  const avgResult = await db('ratings')
    .where({ reviewed_user_id: req.params.userId })
    .avg('score as avg')
    .count('id as count')
    .first();

  res.json({
    data: ratings,
    meta: {
      average: Number(avgResult?.avg || 0).toFixed(1),
      total: Number(avgResult?.count || 0),
    },
  });
});

/**
 * GET /api/v1/ratings/project/:projectId
 * Get all ratings for a project.
 */
ratingsRouter.get('/project/:projectId', async (req: Request, res: Response) => {
  const ratings = await db('ratings')
    .leftJoin('users as reviewer', 'ratings.reviewer_user_id', 'reviewer.id')
    .leftJoin('users as reviewed', 'ratings.reviewed_user_id', 'reviewed.id')
    .where({ 'ratings.project_id': req.params.projectId })
    .select(
      'ratings.*',
      'reviewer.first_name as reviewer_first_name',
      'reviewer.last_name as reviewer_last_name',
      'reviewed.first_name as reviewed_first_name',
      'reviewed.last_name as reviewed_last_name',
    )
    .orderBy('ratings.created_at', 'desc');

  res.json({ data: ratings });
});
