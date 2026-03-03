/**
 * /api/v1/notifications — Spec System 08
 * User notification endpoints: list, mark read, count.
 */
import { Router, Request, Response } from 'express';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser } from '../../middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.use(validateJwt, resolveUser);

/**
 * GET /api/v1/notifications
 * List notifications for the authenticated user.
 */
notificationsRouter.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const offset = (page - 1) * limit;
  const unreadOnly = req.query.unread === 'true';

  let query = db('notifications')
    .where({ user_id: req.user!.userId })
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  if (unreadOnly) {
    query = query.where({ is_read: false });
  }

  const notifications = await query;

  const countResult = await db('notifications')
    .where({ user_id: req.user!.userId, is_read: false })
    .count('id as count')
    .first();

  res.json({
    data: notifications,
    meta: {
      page,
      limit,
      unread_count: Number(countResult?.count || 0),
    },
  });
});

/**
 * GET /api/v1/notifications/count
 * Get unread notification count.
 */
notificationsRouter.get('/count', async (req: Request, res: Response) => {
  const countResult = await db('notifications')
    .where({ user_id: req.user!.userId, is_read: false })
    .count('id as count')
    .first();

  res.json({ data: { unread_count: Number(countResult?.count || 0) } });
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a single notification as read.
 */
notificationsRouter.patch('/:id/read', async (req: Request, res: Response) => {
  const [notification] = await db('notifications')
    .where({ id: req.params.id, user_id: req.user!.userId })
    .update({ is_read: true })
    .returning('*');

  if (!notification) {
    res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Notification not found' }] });
    return;
  }

  res.json({ data: notification });
});

/**
 * POST /api/v1/notifications/read-all
 * Mark all notifications as read.
 */
notificationsRouter.post('/read-all', async (req: Request, res: Response) => {
  const updated = await db('notifications')
    .where({ user_id: req.user!.userId, is_read: false })
    .update({ is_read: true });

  res.json({ data: { marked_read: updated } });
});
