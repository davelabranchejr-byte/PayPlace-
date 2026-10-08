// The button's bounds in the approved security artwork (941 × 1672).
export const UNLOCK_BOUNDS = { left: 194 / 941, top: 1451 / 1672, width: 552 / 941, height: 123 / 1672 };

export function fitLockArtwork(width, height) {
  const scale = Math.min(Math.max(0, width) / 941, Math.max(0, height) / 1672);
  return { width: 941 * scale, height: 1672 * scale };
}
