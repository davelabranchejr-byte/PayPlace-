export function normalizeContact(channel, value) {
  const contact = String(value || '').trim();
  if (channel === 'email') {
    const email = contact.toLowerCase();
    return email.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : null;
  }
  if (channel !== 'sms' || /[^\d+().\s-]/.test(contact)) return null;
  const phone = contact.replace(/[().\s-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

export function hasVerifiedContact(answers) {
  if (answers?.contactVerified === true) return Boolean(normalizeContact(answers.contactChannel, answers.contact));
  return answers?.emailVerified === true && Boolean(normalizeContact('email', answers.email));
}

export function verifiedAnswers(answers, result, expectedChannel, expectedContact, letters) {
  if (result?.verified !== true || result.channel !== expectedChannel || result.contact !== expectedContact || !result.verifiedAt) {
    throw new Error('PayPlace could not confirm your contact details. Request a new code.');
  }
  return {
    ...answers, guest: false, contactVerified: true, contactChannel: result.channel,
    contact: result.contact, contactVerifiedAt: result.verifiedAt,
    email: result.channel === 'email' ? result.contact : '',
    phone: result.channel === 'sms' ? result.contact : '',
    emailVerified: result.channel === 'email', phoneVerified: result.channel === 'sms',
    emailVerifiedAt: result.channel === 'email' ? result.verifiedAt : null,
    annieLetters: letters, notificationChannel: letters ? result.channel : null,
  };
}
