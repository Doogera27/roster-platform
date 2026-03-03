/**
 * Express application setup — Spec Section 8
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { db } from './config/database.js';

// Route imports
import { authRouter } from './routes/auth/index.js';
import { usersRouter } from './routes/users/index.js';
import { creativesRouter } from './routes/creatives/index.js';
import { rostersRouter } from './routes/rosters/index.js';
import { projectsRouter } from './routes/projects/index.js';
import { phasesRouter } from './routes/phases/index.js';
import { vaultRouter } from './routes/vault/index.js';
import { paymentsRouter } from './routes/payments/index.js';
import { adminRouter } from './routes/admin/index.js';
import { notificationsRouter } from './routes/notifications/index.js';
import { activityRouter } from './routes/activity/index.js';
import { ratingsRouter } from './routes/ratings/index.js';
import { messagesRouter } from './routes/messages/index.js';
import { aiPMRouter } from './routes/ai-pm/index.js';

const app = express();

// --- Security middleware ---
app.use(helmet());
app.use(cors({
  origin: config.isDev
    ? ['http://localhost:3000', 'http://localhost:5173']
    : ['https://app.rosterteam.com'],
  credentials: true,
}));

// --- Rate limiting (Spec Section 8.2) ---
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { data: null, errors: [{ code: 'RATE_LIMITED', message: 'Too many requests' }] },
}));

// --- Body parsing & logging ---
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (config.isDev) {
  app.use(morgan('dev'));
}

// --- Health check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Dev-only: user switcher endpoint ---
if (config.isDev) {
  app.get('/api/v1/dev/users', async (_req, res) => {
    const users = await db('users')
      .where({ is_active: true })
      .select('id', 'first_name', 'last_name', 'email', 'role', 'organization_id')
      .orderByRaw("CASE role WHEN 'CLIENT' THEN 1 WHEN 'PM' THEN 2 WHEN 'CREATIVE' THEN 3 END")
      .orderBy('first_name');
    res.json({ data: users });
  });
}

// --- API routes (Spec Section 8.1) ---
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/creatives', creativesRouter);
app.use('/api/v1/rosters', rostersRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/phases', phasesRouter);
app.use('/api/v1/vault', vaultRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/activity', activityRouter);
app.use('/api/v1/ratings', ratingsRouter);
app.use('/api/v1/messages', messagesRouter);
app.use('/api/v1/ai-pm', aiPMRouter);

// --- 404 handler ---
app.use((_req, res) => {
  res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Endpoint not found' }] });
});

// --- Global error handler ---
app.use(errorHandler);

export { app };
