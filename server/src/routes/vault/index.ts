/**
 * /api/v1/vault — Spec System 03
 * Brand Vault: upload, list, version, delete, share via pre-signed URLs.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { validateJwt, resolveUser, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { UserRole } from '../../types/index.js';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config/index.js';
import { v4 as uuid } from 'uuid';

export const vaultRouter = Router();

vaultRouter.use(validateJwt, resolveUser);

const s3 = new S3Client({ region: config.aws.region });

/**
 * GET /api/v1/vault
 * List all assets in the client's Brand Vault.
 */
vaultRouter.get(
  '/',
  requireRole(UserRole.CLIENT, UserRole.PM),
  async (req: Request, res: Response) => {
    const orgId = req.user!.organizationId;
    if (!orgId) {
      res.status(400).json({ data: null, errors: [{ code: 'NO_ORG', message: 'No organization associated' }] });
      return;
    }

    const vault = await db('brand_vaults').where({ organization_id: orgId }).first();
    if (!vault) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Brand Vault not found' }] });
      return;
    }

    const assets = await db('brand_vault_assets')
      .where({ vault_id: vault.id })
      .orderBy('created_at', 'desc');

    res.json({
      data: {
        vault_id: vault.id,
        completeness_score: vault.completeness_score,
        assets,
      },
    });
  },
);

/**
 * POST /api/v1/vault/upload-url
 * Generate a pre-signed S3 upload URL for the client.
 * Client uploads directly to S3, then calls POST /api/v1/vault/confirm.
 */
const uploadUrlSchema = z.object({
  filename: z.string().min(1).max(500),
  file_type: z.string().min(1).max(100),
  file_size_bytes: z.number().int().min(1).max(500_000_000), // 500MB max
  asset_category: z.enum(['brand_guidelines', 'logo', 'font', 'template', 'photography', 'other']).optional(),
});

vaultRouter.post(
  '/upload-url',
  requireRole(UserRole.CLIENT),
  validate({ body: uploadUrlSchema }),
  async (req: Request, res: Response) => {
    const orgId = req.user!.organizationId;
    if (!orgId) {
      res.status(400).json({ data: null, errors: [{ code: 'NO_ORG', message: 'No organization' }] });
      return;
    }

    const vault = await db('brand_vaults').where({ organization_id: orgId }).first();
    if (!vault) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Brand Vault not found' }] });
      return;
    }

    const assetId = uuid();
    const s3Key = `vaults/${vault.id}/${assetId}/${req.body.filename}`;

    const command = new PutObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: s3Key,
      ContentType: req.body.file_type,
      ContentLength: req.body.file_size_bytes,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({
      data: {
        upload_url: uploadUrl,
        asset_id: assetId,
        s3_key: s3Key,
      },
    });
  },
);

/**
 * POST /api/v1/vault/confirm
 * Confirm a completed upload and create the asset record.
 */
const confirmSchema = z.object({
  asset_id: z.string().uuid(),
  s3_key: z.string(),
  filename: z.string(),
  file_type: z.string(),
  file_size_bytes: z.number().int(),
  asset_category: z.string().optional(),
});

vaultRouter.post(
  '/confirm',
  requireRole(UserRole.CLIENT),
  validate({ body: confirmSchema }),
  async (req: Request, res: Response) => {
    const vault = await db('brand_vaults').where({ organization_id: req.user!.organizationId }).first();
    if (!vault) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Vault not found' }] });
      return;
    }

    // Determine version number (increment if same filename exists)
    const existingAsset = await db('brand_vault_assets')
      .where({ vault_id: vault.id, filename: req.body.filename })
      .orderBy('version', 'desc')
      .first();

    const version = existingAsset ? existingAsset.version + 1 : 1;

    const [asset] = await db('brand_vault_assets')
      .insert({
        id: req.body.asset_id,
        vault_id: vault.id,
        filename: req.body.filename,
        file_type: req.body.file_type,
        asset_category: req.body.asset_category,
        s3_key: req.body.s3_key,
        file_size_bytes: req.body.file_size_bytes,
        version,
        uploaded_by_user_id: req.user!.userId,
      })
      .returning('*');

    // Recalculate completeness score
    await updateCompletenessScore(vault.id);

    res.status(201).json({ data: asset });
  },
);

/**
 * GET /api/v1/vault/assets/:assetId/download
 * Generate a pre-signed download URL (24h expiry per spec).
 */
vaultRouter.get(
  '/assets/:assetId/download',
  async (req: Request, res: Response) => {
    const asset = await db('brand_vault_assets')
      .where({ id: req.params.assetId })
      .first();

    if (!asset) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Asset not found' }] });
      return;
    }

    // Verify org access
    const vault = await db('brand_vaults').where({ id: asset.vault_id }).first();
    if (req.user!.role === UserRole.CLIENT && vault.organization_id !== req.user!.organizationId) {
      res.status(403).json({ data: null, errors: [{ code: 'FORBIDDEN', message: 'Access denied' }] });
      return;
    }

    const command = new GetObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: asset.s3_key,
    });

    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 86400 }); // 24h per spec

    res.json({ data: { download_url: downloadUrl } });
  },
);

/**
 * DELETE /api/v1/vault/assets/:assetId
 */
vaultRouter.delete(
  '/assets/:assetId',
  requireRole(UserRole.CLIENT),
  async (req: Request, res: Response) => {
    const asset = await db('brand_vault_assets').where({ id: req.params.assetId }).first();
    if (!asset) {
      res.status(404).json({ data: null, errors: [{ code: 'NOT_FOUND', message: 'Asset not found' }] });
      return;
    }

    const vault = await db('brand_vaults').where({ id: asset.vault_id }).first();
    if (vault.organization_id !== req.user!.organizationId) {
      res.status(403).json({ data: null, errors: [{ code: 'FORBIDDEN', message: 'Access denied' }] });
      return;
    }

    // Delete from S3
    await s3.send(new DeleteObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: asset.s3_key,
    }));

    await db('brand_vault_assets').where({ id: req.params.assetId }).del();
    await updateCompletenessScore(vault.id);

    res.json({ data: { deleted: true } });
  },
);

/**
 * Recalculate vault completeness (Spec System 03).
 * Score based on presence of key asset types.
 */
async function updateCompletenessScore(vaultId: string): Promise<void> {
  const categories = ['brand_guidelines', 'logo', 'font', 'template', 'photography'];
  const existing = await db('brand_vault_assets')
    .where({ vault_id: vaultId })
    .whereIn('asset_category', categories)
    .distinct('asset_category')
    .pluck('asset_category');

  const score = (existing.length / categories.length) * 100;
  await db('brand_vaults').where({ id: vaultId }).update({ completeness_score: score });
}
