/**
 * /api/v1/ai-pm — AI Project Manager API routes.
 *
 * Provides endpoints for:
 * - Project health scanning
 * - Status report generation
 * - Budget analysis
 * - Risk detection
 * - Insight management (acknowledge, dismiss, resolve)
 * - PM dashboard aggregation
 */
import { Router, Request, Response } from 'express';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser, requireRole } from '../../middleware/auth.js';
import { UserRole, InsightStatus } from '../../types/index.js';
import {
  scanProjectHealth,
  generateStatusReport,
  analyzeBudgetBurn,
  detectRisks,
  suggestPhaseActions,
} from '../../services/aiPM.js';

export const aiPMRouter = Router();

aiPMRouter.use(validateJwt, resolveUser);

// ─── Project-Scoped Endpoints ────────────────────────────

/**
 * GET /ai-pm/projects/:id/insights
 * List active insights for a project.
 */
aiPMRouter.get(
  '/projects/:id/insights',
  requireRole(UserRole.PM, UserRole.CLIENT),
  async (req: Request, res: Response) => {
    try {
      const { status, type } = req.query;

      let query = db('ai_pm_insights')
        .where({ project_id: req.params.id as string })
        .orderByRaw("CASE severity WHEN 'CRITICAL' THEN 1 WHEN 'WARNING' THEN 2 WHEN 'INFO' THEN 3 END")
        .orderBy('created_at', 'desc');

      if (status) {
        query = query.where({ status: status as string });
      } else {
        query = query.where({ status: InsightStatus.ACTIVE });
      }

      if (type) {
        query = query.where({ insight_type: type as string });
      }

      const insights = await query.limit(50);

      // Parse JSONB fields
      const parsed = insights.map((i: any) => ({
        ...i,
        details: typeof i.details === 'string' ? JSON.parse(i.details) : i.details,
        recommendations: typeof i.recommendations === 'string' ? JSON.parse(i.recommendations) : i.recommendations,
      }));

      res.json({ data: parsed });
    } catch (err: any) {
      res.status(500).json({ data: null, errors: [{ code: 'INTERNAL', message: err.message }] });
    }
  },
);

/**
 * POST /ai-pm/projects/:id/scan
 * Trigger on-demand health scan.
 */
aiPMRouter.post(
  '/projects/:id/scan',
  requireRole(UserRole.PM),
  async (req: Request, res: Response) => {
    try {
      const insights = await scanProjectHealth(req.params.id as string);
      res.json({ data: insights });
    } catch (err: any) {
      res.status(500).json({ data: null, errors: [{ code: 'SCAN_FAILED', message: err.message }] });
    }
  },
);

/**
 * POST /ai-pm/projects/:id/status-report
 * Generate a status report.
 */
aiPMRouter.post(
  '/projects/:id/status-report',
  requireRole(UserRole.PM),
  async (req: Request, res: Response) => {
    try {
      const report = await generateStatusReport(req.params.id as string);
      res.json({ data: report });
    } catch (err: any) {
      res.status(500).json({ data: null, errors: [{ code: 'REPORT_FAILED', message: err.message }] });
    }
  },
);

/**
 * POST /ai-pm/projects/:id/budget-analysis
 * Generate budget burn analysis.
 */
aiPMRouter.post(
  '/projects/:id/budget-analysis',
  requireRole(UserRole.PM),
  async (req: Request, res: Response) => {
    try {
      const analysis = await analyzeBudgetBurn(req.params.id as string);
      res.json({ data: analysis });
    } catch (err: any) {
      res.status(500).json({ data: null, errors: [{ code: 'ANALYSIS_FAILED', message: err.message }] });
    }
  },
);

/**
 * POST /ai-pm/projects/:id/detect-risks
 * Run focused risk detection.
 */
aiPMRouter.post(
  '/projects/:id/detect-risks',
  requireRole(UserRole.PM),
  async (req: Request, res: Response) => {
    try {
      const risks = await detectRisks(req.params.id as string);
      res.json({ data: risks });
    } catch (err: any) {
      res.status(500).json({ data: null, errors: [{ code: 'RISK_FAILED', message: err.message }] });
    }
  },
);

/**
 * POST /ai-pm/projects/:id/phase-actions
 * Get phase action recommendations.
 */
aiPMRouter.post(
  '/projects/:id/phase-actions',
  requireRole(UserRole.PM),
  async (req: Request, res: Response) => {
    try {
      const recommendations = await suggestPhaseActions(req.params.id as string);
      res.json({ data: recommendations });
    } catch (err: any) {
      res.status(500).json({ data: null, errors: [{ code: 'PHASE_ACTIONS_FAILED', message: err.message }] });
    }
  },
);

// ─── Insight Management ──────────────────────────────────

/**
 * PATCH /ai-pm/insights/:id/acknowledge
 */
aiPMRouter.patch(
  '/insights/:id/acknowledge',
  requireRole(UserRole.PM),
  async (req: Request, res: Response) => {
    try {
      const [insight] = await db('ai_pm_insights')
        .where({ id: req.params.id as string })
        .update({
          status: InsightStatus.ACKNOWLEDGED,
          acknowledged_by_user_id: req.user!.userId,
          acknowledged_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      if (!insight) {
        res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Insight not found' }] });
        return;
      }
      res.json({ data: insight });
    } catch (err: any) {
      res.status(500).json({ data: null, errors: [{ code: 'INTERNAL', message: err.message }] });
    }
  },
);

/**
 * PATCH /ai-pm/insights/:id/dismiss
 */
aiPMRouter.patch(
  '/insights/:id/dismiss',
  requireRole(UserRole.PM),
  async (req: Request, res: Response) => {
    try {
      const [insight] = await db('ai_pm_insights')
        .where({ id: req.params.id as string })
        .update({
          status: InsightStatus.DISMISSED,
          updated_at: new Date(),
        })
        .returning('*');

      if (!insight) {
        res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Insight not found' }] });
        return;
      }
      res.json({ data: insight });
    } catch (err: any) {
      res.status(500).json({ data: null, errors: [{ code: 'INTERNAL', message: err.message }] });
    }
  },
);

/**
 * PATCH /ai-pm/insights/:id/resolve
 */
aiPMRouter.patch(
  '/insights/:id/resolve',
  requireRole(UserRole.PM),
  async (req: Request, res: Response) => {
    try {
      const [insight] = await db('ai_pm_insights')
        .where({ id: req.params.id as string })
        .update({
          status: InsightStatus.RESOLVED,
          resolved_by_user_id: req.user!.userId,
          resolved_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      if (!insight) {
        res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Insight not found' }] });
        return;
      }
      res.json({ data: insight });
    } catch (err: any) {
      res.status(500).json({ data: null, errors: [{ code: 'INTERNAL', message: err.message }] });
    }
  },
);

// ─── Dashboard Aggregation ───────────────────────────────

/**
 * GET /ai-pm/dashboard
 * Aggregated insights across all PM's projects.
 */
aiPMRouter.get(
  '/dashboard',
  requireRole(UserRole.PM),
  async (req: Request, res: Response) => {
    try {
      // Get all projects managed by this PM
      const projects = await db('projects')
        .where({ pm_user_id: req.user!.userId })
        .whereIn('status', ['ACTIVE', 'ON_HOLD'])
        .select('id', 'name');

      const projectIds = projects.map((p: any) => p.id);

      if (projectIds.length === 0) {
        res.json({
          data: {
            critical_count: 0,
            warning_count: 0,
            info_count: 0,
            total_active_insights: 0,
            top_insights: [],
            projects_scanned: 0,
          },
        });
        return;
      }

      // Count insights by severity
      const counts = await db('ai_pm_insights')
        .whereIn('ai_pm_insights.project_id', projectIds)
        .where({ 'ai_pm_insights.status': InsightStatus.ACTIVE })
        .select('severity')
        .count('ai_pm_insights.id as count')
        .groupBy('severity');

      const countMap: Record<string, number> = {};
      counts.forEach((c: any) => {
        countMap[c.severity] = Number(c.count);
      });

      // Top insights (critical + warning, most recent)
      const topInsights = await db('ai_pm_insights')
        .whereIn('ai_pm_insights.project_id', projectIds)
        .where({ 'ai_pm_insights.status': InsightStatus.ACTIVE })
        .whereIn('ai_pm_insights.severity', ['CRITICAL', 'WARNING'])
        .join('projects', 'ai_pm_insights.project_id', 'projects.id')
        .select(
          'ai_pm_insights.*',
          'projects.name as project_name',
        )
        .orderByRaw("CASE ai_pm_insights.severity WHEN 'CRITICAL' THEN 1 WHEN 'WARNING' THEN 2 END")
        .orderBy('ai_pm_insights.created_at', 'desc')
        .limit(10);

      // Parse JSONB
      const parsedInsights = topInsights.map((i: any) => ({
        ...i,
        details: typeof i.details === 'string' ? JSON.parse(i.details) : i.details,
        recommendations: typeof i.recommendations === 'string' ? JSON.parse(i.recommendations) : i.recommendations,
      }));

      res.json({
        data: {
          critical_count: countMap.CRITICAL || 0,
          warning_count: countMap.WARNING || 0,
          info_count: countMap.INFO || 0,
          total_active_insights: (countMap.CRITICAL || 0) + (countMap.WARNING || 0) + (countMap.INFO || 0),
          top_insights: parsedInsights,
          projects_scanned: projectIds.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ data: null, errors: [{ code: 'INTERNAL', message: err.message }] });
    }
  },
);
