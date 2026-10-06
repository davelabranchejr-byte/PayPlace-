export const BACKGROUND_LOCK_MS = 30000;
export const IDLE_LOCK_MS = 5 * 60 * 1000;
export function needsResumeAuthentication(leftAt, now) {
  return leftAt !== null && now - leftAt >= BACKGROUND_LOCK_MS;
}
