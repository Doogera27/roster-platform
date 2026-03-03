/**
 * /api/v1/users — Spec System 01
 * User account management: profile updates, preferences, notification settings.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

export const usersRouter = Router();

// All user routes require auth
usersRouter.use(validateJwt, resolveUser);

const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().optional(),
});

/**
 * GET /api/v1/users/:id
 */
usersRouter.get('/:id', async (req: Request, res: Response) => {
  const user = await db('users')
    .where({ id: req.params.id, is_active: true })
    .select('id', 'first_name', 'last_name', 'role', 'avatar_url', 'created_at')
    .first();

  if (!user) {
    res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'User not found' }] });
    return;
  }

  res.json({ data: user });
});

/**
 * PATCH /api/v1/users/me
 * Update current user's profile.
 */
usersRouter.patch(
  '/me',
  validate({ body: updateProfileSchema }),
  async (req: Request, res: Response) => {
    const [updated] = await db('users')
      .where({ id: req.user!.userId })
      .update({ ...req.body, updated_at: new Date() })
      .returning('*');

    res.json({ data: updated });
  },
);
