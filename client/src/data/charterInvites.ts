/**
 * Charter Creative invite registry.
 *
 * Each key is a URL-friendly invite code that maps to the creative's first name.
 * Zach sends personalised links like: https://roster-platform.netlify.app/charter/sarah-c
 *
 * To add a new invite, just add a new entry here and redeploy.
 */

export interface CharterInvite {
  /** First name shown in the personalised greeting */
  name: string;
}

export const CHARTER_INVITES: Record<string, CharterInvite> = {
  // ── Placeholder invites — replace / extend with real creatives ──
  'sarah-c': { name: 'Sarah' },
  'mike-r': { name: 'Mike' },
  'jess-t': { name: 'Jess' },
  'alex-m': { name: 'Alex' },
  'dana-w': { name: 'Dana' },
};

/** Check whether a code maps to a valid invite */
export function isValidInvite(code: string): boolean {
  return code in CHARTER_INVITES;
}

/** Look up the invite data (returns undefined for invalid codes) */
export function getInvite(code: string): CharterInvite | undefined {
  return CHARTER_INVITES[code];
}
