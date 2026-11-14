import React from 'react';
import { Image, View } from 'react-native';
import PayPlaceBadge from './PayPlaceBadge';
export const ACTION_ARTWORK = Object.freeze({
  billMicropayment:require('../assets/characters/feature-micropayments-billiam.png'),
  onboardingPayday:require('../assets/characters/onboarding-payday-westley.png'),
  debtHelp:require('../assets/characters/feature-how-debt-works.png'),
  homeGuide:require('../assets/characters/feature-how-home-works-daddy.png'),
  close:require('../assets/actions/close.jpg'),
  scrapbook:require('../assets/actions/scrapbook.jpg'),
  banking:require('../assets/characters/feature-plaid-banking-entry.png'),
  debt:require('../assets/characters/snapshot-debt-plan.png'),
  subscriptions:require('../assets/characters/subscription-detective-bobbie-tile.jpg'),
  monthlyCalendar:require('../assets/characters/feature-monthly-calendar-billiam.png'),
  editBudget:require('../assets/characters/header-budget-daddy-chapo.png'),
  budgetPayday:require('../assets/characters/snapshot-next-paycheck.png'),
  payoffGuide:require('../assets/characters/nav-debt-climb.png'),
  smallStep:require('../assets/characters/feature-one-small-step-westley.png'),
  firstWin:require('../assets/characters/feature-first-win.png'),
  payday:require('../assets/characters/feature-until-payday.png'),
  calendar:require('../assets/characters/snapshot-extra-check.png'),
  savingsGoal:require('../assets/characters/savings-goals-button-chapo.png'),
  paymentHistory:require('../assets/characters/feature-payment-history.png'),
  quiet:require('../assets/characters/feature-quiet-mode.png'),
  overwhelmed:require('../assets/characters/overwhelmed-westley-cozy.jpg'),
  reviewBills:require('../assets/characters/home-bills-westley.png'),
  homePayoff:require('../assets/characters/home-payoff-methods-westley.png'),
  homeCabaret:require('../assets/characters/home-cabaret-bobbie.png'),
  neighborhood:require('../assets/characters/neighborhood-tabby.png'),
  mailbox:require('../assets/characters/billiam-mailbox.png'),
  billTools:require('../assets/characters/billiam-canonical.png'),
  welcome:require('../assets/characters/lock-annie-fort-knox-family.png'),
  annieCare:require('../assets/characters/feature-annie-care.png'),
  anniePoster:require('../assets/characters/feature-annie-porch-poster.png'),
});
// These illustrations have plain fabric at the badge positions. Render the
// approved master there so clothing never relies on a painted approximation.
const badgePlacement = {
  monthlyCalendar: { left: '29%', top: '13%' },
  smallStep: { left: '24%', top: '44.5%' },
  homeGuide: { left: '31%', top: '51.5%' },
  billMicropayment: { left: '37%', top: '6.5%' },
  onboardingPayday: { left: '68%', top: '63%' },
};

export default function ActionArtwork({ action, size = 112 }) {
  if (!Object.hasOwn(ACTION_ARTWORK, action)) return null;
  const artwork = <Image source={ACTION_ARTWORK[action]} resizeMode="contain"
    accessible={false} importantForAccessibility="no" pointerEvents="none"
    style={{ width: size, height: size, borderRadius: 12, flexShrink: 0 }} />;
  const placement = badgePlacement[action];
  if (!placement) return artwork;
  return <View pointerEvents="none" style={{ width: size, height: size, flexShrink: 0 }}>
    {artwork}
    <PayPlaceBadge size={size * 0.1} {...placement} />
  </View>;
}
