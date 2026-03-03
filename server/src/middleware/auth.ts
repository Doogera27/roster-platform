/**
 * Auth0 JWT middleware — Spec System 01
 * Validates JWT, extracts user context, enforces role-based access.
 */
import { Request, Response, NextFunction } from 'express';
import { auth, requiredScopes } from 'express-oauth2-jwt-bearer';
import { db } from '../config/database.js';
import { config } from '../config/index.js';
import { UserRole, type AuthContext } from '../types/index.js';

// Extend Express Request to carry auth context
declare global {
  namespace Express {
    interface Request {
      user?: AuthContext;
    }
  }
}

/**
 * JWT validation middleware (Auth0).
 * In dev mode (no Auth0 configured), skips JWT validation entirely.
 */
const isAuth0Configured =
  config.auth0.domain &&
  !config.auth0.domain.startsWith('your-tenant') &&
  config.auth0.audience &&
  config.auth0.audience !== 'https://api.roster.dev' &&
  config.auth0.audience !== 'https://api.rosterteam.com';

export const validateJwt = isAuth0Configured
  ? auth({
      issuerBaseURL: `https://${config.auth0.domain}/`,
      audience: config.auth0.audience,
    })
  : (_req: Request, _res: Response, next: NextFunction) => {
      // Dev mode: skip JWT validation
      next();
    };

/**
 * After JWT validation, resolve the Auth0 sub to a Roster user
 * and attach the AuthContext to req.user.
 */
export async function resolveUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Dev mode: if Auth0 not configured, resolve user from X-Dev-User-Id header or default to first user
    if (!isAuth0Configured) {
      const devUserId = req.headers['x-dev-user-id'] as string | undefined;
      let user;
      if (devUserId) {
        user = await db('users').where({ id: devUserId, is_active: true }).first();
      }
      if (!user) {
        user = await db('users').where({ is_active: true }).first();
      }
      if (user) {
        req.user = {
          sub: user.auth0_id || 'dev|local',
          userId: user.id,
          role: user.role as UserRole,
          organizationId: user.organization_id,
        };
      } else {
        // No users in DB yet — create a passthrough dev context
        req.user = {
          sub: 'dev|local',
          userId: 'dev-user-id',
          role: UserRole.CLIENT,
          organizationId: null,
        };
      }
      next();
      return;
    }

    const auth0Id = req.auth?.payload?.sub as string | undefined;
    if (!auth0Id) {
      res.status(401).json({ data: null, errors: [{ code: 'UNAUTHORIZED', message: 'Missing auth subject' }] });
      return;
    }

    const user = await db('users').where({ auth0_id: auth0Id, is_active: true }).first();
    if (!user) {
      res.status(403).json({ data: null, errors: [{ code: 'USER_NOT_FOUND', message: 'No active Roster account for this auth token' }] });
      return;
    }

    req.user = {
      sub: auth0Id,
      userId: user.id,
      role: user.role as UserRole,
      organizationId: user.organization_id,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role guard factory.
 * Usage: requireRole(UserRole.CLIENT, UserRole.PM)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        data: null,
        errors: [{ code: 'FORBIDDEN', message: `Requires role: ${roles.join(' | ')}` }],
      });
      return;
    }
    next();
  };
}

/**
 * Organization scope guard.
 * Ensures the user belongs to the organization referenced by :organizationId param.
 */
export function requireOrgAccess(req: Request, res: Response, next: NextFunction): void {
  const orgId = req.params.organizationId || req.body?.organization_id;
  if (req.user?.role === UserRole.PM) {
    // PMs have cross-org access
    next();
    return;
  }
  if (!orgId || req.user?.organizationId !== orgId) {
    res.status(403).json({
      data: null,
      errors: [{ code: 'ORG_FORBIDDEN', message: 'You do not have access to this organization' }],
    });
    return;
  }
  next();
}
