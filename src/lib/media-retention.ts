// PRD §7.9/§8: photos are retained for at most 90 days, then auto-purged by
// the API's MediaAssetPurgeJob. Used to distinguish "purged" from "never had photos"
// in both the admin job detail view and the customer booking status page.
export const MEDIA_RETENTION_DAYS = 90;

export function isMediaLikelyPurged(createdAt: string): boolean {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs > MEDIA_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}
