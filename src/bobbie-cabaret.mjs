export const QUESTION_TOPICS = ['Everyday money', 'Bills & debt', 'Spending & saving', 'Neighborhood life'];
export function prepareQuestion(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Please enter your question.');
  const question = typeof input.question === 'string' ? input.question.trim() : '';
  const stageName = typeof input.stageName === 'string' ? input.stageName.trim() : '';
  if (question.length < 10 || question.length > 1500) throw new Error('Give Bobbie a question between 10 and 1,500 characters.');
  if (stageName.length > 40 || /[\u0000-\u001f\u007f]/.test(stageName)) throw new Error('Keep your stage name to 40 characters, without line breaks.');
  if (!QUESTION_TOPICS.includes(input.topic)) throw new Error('Choose a question topic.');
  if (typeof input.featureConsent !== 'boolean') throw new Error('Choose whether your question may be featured.');
  const replyEmail = typeof input.replyEmail === 'string' ? input.replyEmail.trim().toLowerCase() : '';
  if ((input.replyEmail != null && typeof input.replyEmail !== 'string') ||
      (replyEmail && (replyEmail.length > 254 || !/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(replyEmail)))) {
    throw new Error('Enter a valid reply email, or leave it blank.');
  }
  return {
    question, stageName: stageName || 'Anonymous neighbor', topic: input.topic, featureConsent: input.featureConsent,
    consentVersion: 'bobbie-show-v1', ...(replyEmail ? { replyEmail } : {}),
  };
}
