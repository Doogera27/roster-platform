/**
 * Tier Progression Service — Spec System 11
 * Evaluates creative profiles and upgrades/downgrades tier:
 * - MEMBER: Default tier for approved creatives
 * - PRO: 5+ completed projects, 4.0+ avg rating, 80%+ re-engagement
 * - ELITE: 15+ completed projects, 4.5+ avg rating, 90%+ re-engagement, invited
 */
import { db } from '../config/database.js';
import { notify } from './notifications.js';

interface TierCheckResult {
  currentTier: string;
  newTier: string;
  changed: boolean;
  metrics: {
    projects_completed: number;
    average_rating: number;
    re_engagement_rate: number;
  };
}

const TIER_REQUIREMENTS = {
  ELITE: { projects: 15, rating: 4.5, reEngagement: 0.9 },
  PRO: { projects: 5, rating: 4.0, reEngagement: 0.8 },
  MEMBER: { projects: 0, rating: 0, reEngagement: 0 },
};

/**
 * Evaluate a creative's tier and update if needed.
 */
export async function evaluateTier(userId: string): Promise<TierCheckResult> {
  const profile = await db('creative_profiles').where({ user_id: userId }).first();
  if (!profile) throw new Error('Creative profile not found');

  const metrics = {
    projects_completed: profile.projects_completed || 0,
    average_rating: Number(profile.average_rating) || 0,
    re_engagement_rate: Number(profile.re_engagement_rate) || 0,
  };

  let newTier = 'MEMBER';

  // Check ELITE first (highest tier)
  if (
    metrics.projects_completed >= TIER_REQUIREMENTS.ELITE.projects &&
    metrics.average_rating >= TIER_REQUIREMENTS.ELITE.rating &&
    metrics.re_engagement_rate >= TIER_REQUIREMENTS.ELITE.reEngagement
  ) {
    newTier = 'ELITE';
  }
  // Check PRO
  else if (
    metrics.projects_completed >= TIER_REQUIREMENTS.PRO.projects &&
    metrics.average_rating >= TIER_REQUIREMENTS.PRO.rating &&
    metrics.re_engagement_rate >= TIER_REQUIREMENTS.PRO.reEngagement
  ) {
    newTier = 'PRO';
  }

  const changed = newTier !== profile.tier;

  if (changed) {
    await db('creative_profiles')
      .where({ user_id: userId })
      .update({ tier: newTier, updated_at: new Date() });

    // Notify the creative about tier change
    const tierLabels: Record<string, string> = {
      MEMBER: 'Member',
      PRO: 'Pro',
      ELITE: 'Elite',
    };

    const isUpgrade = tierOrder(newTier) > tierOrder(profile.tier);
    await notify({
      userId,
      type: 'general',
      title: isUpgrade
        ? `Congratulations! You've been promoted to ${tierLabels[newTier]} tier`
        : `Your tier has been updated to ${tierLabels[newTier]}`,
      body: isUpgrade
        ? `Your performance has earned you ${tierLabels[newTier]} status. This unlocks higher-profile projects and priority matching.`
        : `Based on recent performance metrics, your tier has been adjusted.`,
    });
  }

  return {
    currentTier: profile.tier,
    newTier,
    changed,
    metrics,
  };
}

function tierOrder(tier: string): number {
  const order: Record<string, number> = { MEMBER: 1, PRO: 2, ELITE: 3 };
  return order[tier] || 0;
}

/**
 * Evaluate all creatives and update tiers.
 * Should be run periodically (e.g., daily via cron).
 */
export async function evaluateAllTiers(): Promise<{ updated: number; total: number }> {
  const profiles = await db('creative_profiles')
    .where({ application_status: 'APPROVED' })
    .select('user_id');

  let updated = 0;
  for (const profile of profiles) {
    const result = await evaluateTier(profile.user_id);
    if (result.changed) updated++;
  }

  return { updated, total: profiles.length };
}
