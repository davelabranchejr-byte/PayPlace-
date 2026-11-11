// Destination artwork is intentional. Broad keyword matches made unrelated
// features share the same painting, despite dedicated original scenes existing.
export const FEATURE_ACTIONS = Object.freeze({
  'One small step': 'smallStep',
  'Until next payday': 'payday',
  'Your first win with Annie': 'firstWin',
  'Review my bills': 'reviewBills',
  'Payoff methods': 'homePayoff',
  'Bobbie’s Cabaret Show': 'homeCabaret',
  'Neighborhood': 'neighborhood',
  'Billiam’s Mailbox': 'mailbox',
  'Billiam’s bill tools': 'billTools',
  'I am overwhelmed': 'overwhelmed',
  'Quiet Mode': 'quiet',
  'Visit Annie again': 'welcome',
  'Banking Demo': 'banking',
  'My debt plan': 'debt',
  'Undo & payment history': 'paymentHistory',
  'Subscription Detective': 'subscriptions',
  'Extra Paycheck Calendar': 'calendar',
  'Savings Goals': 'savingsGoal',
});

// Scene assignment is limited to known feature titles. User-entered names,
// accessibility hints and ordinary commands cannot opt into a painting.
export function featureArtworkForTitle(title) {
  return Object.hasOwn(FEATURE_ACTIONS, title) ? FEATURE_ACTIONS[title] : undefined;
}
