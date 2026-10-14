// Remote confirmation must succeed before the personal plan is erased.
export async function completeDataDeletion({ api, challenge, code, deleteDevice, serverDeleted = false }) {
  if (!serverDeleted) {
    if (!challenge || challenge.expiresAt <= Date.now()) throw new Error('Your deletion code expired. Request a new code.');
    const result = await api('delete', { challengeId: challenge.challengeId, code, confirm: true });
    if (result.deleted !== true) throw new Error('Server deletion was not confirmed. Your saved plan stays on this device.');
  }
  try { await deleteDevice(); }
  catch {
    const error = new Error('Service records were deleted, but this device could not be cleared. Keep this screen open and tap Retry device cleanup.');
    error.serverDeleted = true; throw error;
  }
}
