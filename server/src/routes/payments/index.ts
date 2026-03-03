/**
 * /api/v1/payments — Spec System 09
 * Billing: subscription management, invoices, payout history.
 * Stage 2 implementation — stubs for core flows.
 */
import { Router, Request, Response } from 'express';
import { validateJwt, resolveUser, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';
import { db } from '../../config/database.js';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { notify } from '../../services/notifications.js';

export const paymentsRouter = Router();

paymentsRouter.use(validateJwt, resolveUser);

/**
 * GET /api/v1/payments/invoices
 * List invoices for the client's organization.
 */
paymentsRouter.get(
  '/invoices',
  requireRole(UserRole.CLIENT, UserRole.PM),
  async (req: Request, res: Response) => {
    const orgId = req.user!.role === UserRole.PM
      ? req.query.organization_id as string
      : req.user!.organizationId;

    if (!orgId) {
      res.status(400).json({ data: null, errors: [{ code: 'MISSING_ORG', message: 'Organization ID required' }] });
      return;
    }

    const invoices = await db('invoices')
      .where({ organization_id: orgId })
      .orderBy('created_at', 'desc');

    res.json({ data: invoices });
  },
);

/**
 * GET /api/v1/payments/invoices/:id
 */
paymentsRouter.get('/invoices/:id', async (req: Request, res: Response) => {
  const invoice = await db('invoices').where({ id: req.params.id }).first();
  if (!invoice) {
    res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Invoice not found' }] });
    return;
  }
  res.json({ data: invoice });
});

/**
 * POST /api/v1/payments/invoices
 * Create a new invoice for a project (PM only).
 */
const createInvoiceSchema = z.object({
  project_id: z.string().uuid(),
  amount_cents: z.number().int().min(1),
  platform_fee_cents: z.number().int().min(0).default(0),
  due_date: z.string(), // ISO date
  description: z.string().optional(),
});

paymentsRouter.post(
  '/invoices',
  requireRole(UserRole.PM),
  validate({ body: createInvoiceSchema }),
  async (req: Request, res: Response) => {
    const project = await db('projects').where({ id: req.body.project_id }).first();
    if (!project) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Project not found' }] });
      return;
    }

    const platformFee = req.body.platform_fee_cents || Math.round(req.body.amount_cents * 0.15); // 15% default

    const [invoice] = await db('invoices')
      .insert({
        project_id: req.body.project_id,
        organization_id: project.organization_id,
        amount_cents: req.body.amount_cents,
        platform_fee_cents: platformFee,
        status: 'DRAFT',
        due_date: req.body.due_date,
      })
      .returning('*');

    res.status(201).json({ data: invoice });
  },
);

/**
 * PATCH /api/v1/payments/invoices/:id/send
 * Send an invoice (changes status from DRAFT to SENT).
 */
paymentsRouter.patch(
  '/invoices/:id/send',
  requireRole(UserRole.PM),
  async (req: Request, res: Response) => {
    const [invoice] = await db('invoices')
      .where({ id: req.params.id, status: 'DRAFT' })
      .update({ status: 'SENT', updated_at: new Date() })
      .returning('*');

    if (!invoice) {
      res.status(400).json({ data: null, errors: [{ code: 'INVALID_STATE', message: 'Invoice not in DRAFT status' }] });
      return;
    }

    // Notify client org users
    const clientUsers = await db('users')
      .where({ organization_id: invoice.organization_id, role: 'CLIENT', is_active: true })
      .select('id');

    for (const user of clientUsers) {
      await notify({
        userId: user.id,
        type: 'general',
        title: 'New Invoice',
        body: `An invoice for $${(invoice.amount_cents / 100).toLocaleString()} is due ${new Date(invoice.due_date).toLocaleDateString()}.`,
        link: '/settings',
        projectId: invoice.project_id,
      });
    }

    res.json({ data: invoice });
  },
);

/**
 * PATCH /api/v1/payments/invoices/:id/mark-paid
 * Mark an invoice as paid (PM or CLIENT).
 */
paymentsRouter.patch(
  '/invoices/:id/mark-paid',
  requireRole(UserRole.PM, UserRole.CLIENT),
  async (req: Request, res: Response) => {
    const [invoice] = await db('invoices')
      .where({ id: req.params.id })
      .whereIn('status', ['SENT', 'OVERDUE'])
      .update({ status: 'PAID', paid_at: new Date(), updated_at: new Date() })
      .returning('*');

    if (!invoice) {
      res.status(400).json({ data: null, errors: [{ code: 'INVALID_STATE', message: 'Invoice cannot be marked as paid' }] });
      return;
    }

    res.json({ data: invoice });
  },
);

/**
 * POST /api/v1/payments/webhooks/stripe
 * Stripe webhook handler — processes subscription and payment events.
 * NOTE: In production, this should verify the Stripe signature.
 */
paymentsRouter.post('/webhooks/stripe', async (req: Request, res: Response) => {
  // TODO: Implement Stripe webhook signature verification
  // TODO: Handle subscription.created, invoice.paid, payment_intent.succeeded etc.
  console.log('Stripe webhook received:', req.body.type);
  res.json({ received: true });
});
