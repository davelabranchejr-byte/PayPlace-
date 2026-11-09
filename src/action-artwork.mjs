// Explicit semantic keys take priority. Labels are only a fallback for shared
// controls; merchant/account rows supply their key at the call site.
export function actionForLabel(value = '') {
  const label = String(value).toLowerCase();
  const rules = [
    ['reject', /reject|keep private|remove from town/], ['approve', /approv|review queue/],
    ['remove', /delete|remove|forget/], ['close', /close|cancel|hide|fewer|sign out/],
    ['pause', /pause|motion off/], ['play', /^(play|resume)|start.*(scene|video)/],
    ['scrapbook', /scrapbook|past visit/], ['split', /split/], ['remember', /remember|recurring/],
    ['edit', /edit|correct|change.*(amount|detail|category)/], ['save', /save|record|confirm|finish|complete|keep this/],
    ['refresh', /refresh|retry|try again|undo|restore/], ['scan', /scan|camera|photo|import|upload|file/],
    ['banking', /bank|plaid|account|balance/], ['debt', /debt|payoff|snowball|avalanche/],
    ['savings', /saving|goal|round.?up/], ['budget', /budget|spending|payday|paycheck/],
    ['subscriptions', /subscription|detective/], ['security', /security|privacy|backup|unlock|sign.in|verification|owner code/],
    ['community', /facebook|join.*neighborhood/], ['feedback', /feedback|report|tester/],
    ['help', /help|how .*work|explain|overwhelmed/], ['add', /add|new purchase|create/],
    ['calm', /calm|breath|quiet/], ['mail', /bill|mail|letter/],
  ];
  return rules.find(([,pattern]) => pattern.test(label))?.[0] || 'browse';
}
