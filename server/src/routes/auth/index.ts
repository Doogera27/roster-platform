/**
 * /api/v1/auth — Spec System 01
 * Handles user registration callback, profile sync, and session info.
 * Auth0 handles actual login/MFA/social — we handle post-auth user creation.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { UserRole } from '../../types/index.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  role: z.enum(['CLIENT', 'CREATIVE']),
  organization_name: z.string().optional(),
});

/**
 * POST /api/v1/auth/register
 * Called after first Auth0 login to create the Roster user record.
 */
authRouter.post(
  '/register',
  validateJwt,
  validate({ body: registerSchema }),
  async (req: Request, res: Response) => {
    const auth0Id = req.auth?.payload?.sub as string;
    const { email, first_name, last_name, role, organization_name } = req.body;

    // Check if user already exists
    const existing = await db('users').where({ auth0_id: auth0Id }).first();
    if (existing) {
      res.status(409).json({
        data: null,
        errors: [{ code: 'ALREADY_EXISTS', message: 'User already registered' }],
      });
      return;
    }

    const trx = await db.transaction();
    try {
      let organizationId: string | null = null;

      // Create organization for client users
      if (role === 'CLIENT' && organization_name) {
        const [org] = await trx('organizations')
          .insert({ name: organization_name })
          .returning('*');
        organizationId = org.id;

        // Create brand vault for the organization
        await trx('brand_vaults').insert({ organization_id: org.id });
      }

      const [user] = await trx('users')
        .insert({
          auth0_id: auth0Id,
          email,
          first_name,
          last_name,
          role,
          organization_id: organizationId,
        })
        .returning('*');

      // Create creative profile stub for creative users
      if (role === 'CREATIVE') {
        await trx('creative_profiles').insert({ user_id: user.id });
      }

      await trx.commit();

      res.status(201).json({ data: user });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },
);

/**
 * GET /api/v1/auth/me
 * Returns the current user's profile and role.
 */
authRouter.get('/me', validateJwt, resolveUser, async (req: Request, res: Response) => {
  const user = await db('users').where({ id: req.user!.userId }).first();
  const profile: Record<string, unknown> = { ...user };

  if (user.role === UserRole.CREATIVE) {
    profile.creative_profile = await db('creative_profiles').where({ user_id: user.id }).first();
  }

  if (user.organization_id) {
    profile.organization = await db('organizations').where({ id: user.organization_id }).first();
  }

  res.json({ data: profile });
});

/**
 * POST /api/v1/auth/onboarding
 * Complete client onboarding — sets up organization details.
 */
const onboardingSchema = z.object({
  company_name: z.string().min(1).max(200),
  website: z.string().max(500).optional(),
  industry: z.string().min(1).max(100),
  brand_description: z.string().max(5000).optional(),
  creative_needs: z.array(z.string()).optional(),
  team_size: z.string().optional(),
});

authRouter.post(
  '/onboarding',
  validateJwt,
  resolveUser,
  validate({ body: onboardingSchema }),
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await db('users').where({ id: userId }).first();

    if (!user) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'User not found' }] });
      return;
    }

    const trx = await db.transaction();
    try {
      if (user.organization_id) {
        await trx('organizations')
          .where({ id: user.organization_id })
          .update({
            name: req.body.company_name,
            domain: req.body.website || null,
            industry: req.body.industry,
            onboarding_completed_at: new Date(),
            updated_at: new Date(),
          });
      } else {
        const [org] = await trx('organizations')
          .insert({
            name: req.body.company_name,
            domain: req.body.website || null,
            industry: req.body.industry,
            onboarding_completed_at: new Date(),
          })
          .returning('*');

        await trx('users').where({ id: userId }).update({ organization_id: org.id });
        await trx('brand_vaults').insert({ organization_id: org.id });
      }

      await trx.commit();

      const updated = await db('users').where({ id: userId }).first();
      const org = await db('organizations').where({ id: updated.organization_id }).first();

      res.json({ data: { ...updated, organization: org } });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },
);

/**
 * POST /api/v1/auth/refresh
 * Placeholder — refresh token rotation is handled by Auth0 SDK on the client.
 * This endpoint exists for future server-side session tracking.
 */
authRouter.post('/refresh', validateJwt, (_req: Request, res: Response) => {
  res.json({ data: { message: 'Token refresh handled by Auth0 client SDK' } });
});
