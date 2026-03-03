/**
 * /api/v1/activity — Project Activity Feed
 * Returns chronological activity for a project.
 */
import { Router, Request, Response } from 'express';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser } from '../../middleware/auth.js';

export const activityRouter = Router();

activityRouter.use(validateJwt, resolveUser);

/**
 * GET /api/v1/activity/:projectId
 * List activity feed for a project, with user info joined.
 */
activityRouter.get('/:projectId', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 30);
  const offset = (page - 1) * limit;

  const activities = await db('activity_feed')
    .leftJoin('users', 'activity_feed.user_id', 'users.id')
    .where({ 'activity_feed.project_id': req.params.projectId })
    .orderBy('activity_feed.created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .select(
      'activity_feed.*',
      'users.first_name as user_first_name',
      'users.last_name as user_last_name',
      'users.avatar_url as user_avatar_url',
      'users.role as user_role',
    );

  res.json({ data: activities });
});
