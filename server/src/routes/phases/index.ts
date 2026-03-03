/**
 * /api/v1/phases — Spec Systems 06 & 07
 * Phase management: activate, submit deliverable, approve, reject.
 * Implements the DAG dependency traversal from Spec Section 3.2.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { UserRole, PhaseStatus, DeliverableStatus } from '../../types/index.js';
import { enqueueProjectScan } from '../../jobs/aiPMWorker.js';

export const phasesRouter = Router();

phasesRouter.use(validateJwt, resolveUser);

/**
 * POST /api/v1/phases/:id/deliverables
 * Submit a deliverable for a phase. Spec System 07.
 */
const submitDeliverableSchema = z.object({
  title: z.string().min(1).max(300),
  file_s3_key: z.string().optional(),
  file_type: z.string().optional(),
});

phasesRouter.post(
  '/:id/deliverables',
  requireRole(UserRole.CREATIVE),
  validate({ body: submitDeliverableSchema }),
  async (req: Request, res: Response) => {
    const phase = await db('project_phases').where({ id: req.params.id }).first();
    if (!phase || phase.status !== PhaseStatus.ACTIVE) {
      res.status(400).json({
        data: null,
        errors: [{ code: 'INVALID_STATE', message: 'Phase must be ACTIVE to submit deliverables' }],
      });
      return;
    }

    // Check the next revision number
    const lastDeliverable = await db('deliverables')
      .where({ phase_id: req.params.id })
      .orderBy('revision_number', 'desc')
      .first();

    const [deliverable] = await db('deliverables')
      .insert({
        phase_id: req.params.id,
        submitted_by_user_id: req.user!.userId,
        title: req.body.title,
        file_s3_key: req.body.file_s3_key,
        file_type: req.body.file_type,
        status: DeliverableStatus.SUBMITTED,
        revision_number: lastDeliverable ? lastDeliverable.revision_number + 1 : 1,
      })
      .returning('*');

    res.status(201).json({ data: deliverable });
  },
);

/**
 * PATCH /api/v1/phases/:phaseId/deliverables/:deliverableId/approve
 * Approve a deliverable. If all phase deliverables approved, mark phase COMPLETE
 * and trigger DAG traversal. Spec Section 3.2.
 */
phasesRouter.patch(
  '/:phaseId/deliverables/:deliverableId/approve',
  requireRole(UserRole.CLIENT, UserRole.PM),
  async (req: Request, res: Response) => {
    const trx = await db.transaction();
    try {
      const [deliverable] = await trx('deliverables')
        .where({ id: req.params.deliverableId, phase_id: req.params.phaseId })
        .update({
          status: DeliverableStatus.APPROVED,
          reviewed_by_user_id: req.user!.userId,
          reviewed_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      if (!deliverable) {
        await trx.rollback();
        res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Deliverable not found' }] });
        return;
      }

      // Check if all deliverables for this phase are approved
      const pendingCount = await trx('deliverables')
        .where({ phase_id: req.params.phaseId })
        .whereNot({ status: DeliverableStatus.APPROVED })
        .count('id as count')
        .first();

      if (Number(pendingCount?.count) === 0) {
        // Mark phase COMPLETE
        await trx('project_phases')
          .where({ id: req.params.phaseId })
          .update({
            status: PhaseStatus.COMPLETE,
            completed_at: new Date(),
            updated_at: new Date(),
          });

        // DAG traversal — activate newly unblocked phases (Spec Section 3.2)
        // CRITICAL: This must be idempotent per spec
        const phase = await trx('project_phases').where({ id: req.params.phaseId }).first();
        await activateDependentPhases(trx, phase.project_id);

        // Trigger AI PM scan on phase completion
        enqueueProjectScan(phase.project_id).catch(() => {});
      }

      await trx.commit();
      res.json({ data: deliverable });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },
);

/**
 * PATCH /api/v1/phases/:phaseId/deliverables/:deliverableId/request-revision
 * Request revision on a deliverable. Spec System 07.
 */
const revisionSchema = z.object({
  feedback: z.string().min(1).max(5000),
});

phasesRouter.patch(
  '/:phaseId/deliverables/:deliverableId/request-revision',
  requireRole(UserRole.CLIENT, UserRole.PM),
  validate({ body: revisionSchema }),
  async (req: Request, res: Response) => {
    const [deliverable] = await db('deliverables')
      .where({ id: req.params.deliverableId, phase_id: req.params.phaseId })
      .update({
        status: DeliverableStatus.REVISION_REQUESTED,
        feedback: req.body.feedback,
        reviewed_by_user_id: req.user!.userId,
        reviewed_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    if (!deliverable) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Deliverable not found' }] });
      return;
    }

    // Trigger AI PM scan if revision count is high (3+)
    if (deliverable.revision_number >= 3) {
      const phase = await db('project_phases').where({ id: req.params.phaseId }).first();
      if (phase) {
        enqueueProjectScan(phase.project_id).catch(() => {});
      }
    }

    res.json({ data: deliverable });
  },
);

/**
 * GET /api/v1/phases/:id/deliverables
 * List deliverables for a phase.
 */
phasesRouter.get('/:id/deliverables', async (req: Request, res: Response) => {
  const deliverables = await db('deliverables')
    .where({ phase_id: req.params.id })
    .orderBy('revision_number', 'desc');

  res.json({ data: deliverables });
});

/**
 * DAG dependency traversal — Spec Section 3.2
 * After a phase completes, find all phases whose depends_on are now fully satisfied.
 * Uses row-level locking to prevent race conditions (per spec CRITICAL note).
 */
async function activateDependentPhases(trx: any, projectId: string): Promise<void> {
  // Get all phases for this project with row-level lock
  const allPhases = await trx('project_phases')
    .where({ project_id: projectId })
    .forUpdate(); // Row-level locking per spec

  const completedIds = new Set(
    allPhases
      .filter((p: any) => p.status === PhaseStatus.COMPLETE)
      .map((p: any) => p.id)
  );

  for (const phase of allPhases) {
    if (phase.status !== PhaseStatus.PENDING) continue;

    const dependsOn: string[] = phase.depends_on || [];
    if (dependsOn.length === 0) continue; // Root phases should already be ACTIVE

    // Check if all dependencies are complete
    const allDepsComplete = dependsOn.every((depId: string) => completedIds.has(depId));

    if (allDepsComplete) {
      await trx('project_phases')
        .where({ id: phase.id })
        .update({
          status: PhaseStatus.ACTIVE,
          activated_at: new Date(),
          updated_at: new Date(),
        });
    }
  }
}
