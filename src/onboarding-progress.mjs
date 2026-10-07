import { hasVerifiedContact } from './contact-verification.mjs';

export function canEnterNeighborhood(profile) {
  return profile?.completed === true && hasVerifiedContact(profile);
}

export function onboardingPosition(profile, stepCount) {
  const saved = profile?.onboardingProgress;
  const last = Math.max(0, stepCount - 1);
  if (saved?.version === 1 && ['annie', 'questions', 'quilt', 'email'].includes(saved.stage)) {
    return { stage: saved.stage, stepIndex: Math.min(last, Math.max(0,
      Number.isInteger(saved.stepIndex) ? saved.stepIndex : 0)) };
  }
  // Older completed profiles lacking valid verification go directly to the code
  // screen. They never gain access just because they have a completed flag.
  return { stage: profile?.completed ? 'email' : 'annie', stepIndex: 0 };
}

export function onboardingDraft(answers, stage, stepIndex) {
  return { ...answers, completed: false,
    onboardingProgress: { version: 1, stage, stepIndex } };
}

export function completedProfile(answers, completedAt = new Date().toISOString()) {
  if (!hasVerifiedContact(answers)) throw new Error('Confirm your email before entering PayPlace.');
  const { onboardingProgress, ...profile } = answers;
  return { ...profile, completed: true, completedAt };
}

export function restoredProfile(profile, stepCount) {
  // Portable backups intentionally omit verification and letter consent. Keep
  // the answers, but resume at verification rather than repeating every question.
  return onboardingDraft({ ...profile, contactVerified: false, emailVerified: false,
    phoneVerified: false, annieLetters: false }, 'email', Math.max(0, stepCount - 1));
}
