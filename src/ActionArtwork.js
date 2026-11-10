import React from 'react';
import { Image } from 'react-native';
export const ACTION_ARTWORK = Object.freeze({
  save:require('../assets/actions/save.jpg'),edit:require('../assets/actions/edit.jpg'),remove:require('../assets/actions/remove.jpg'),browse:require('../assets/actions/browse.png'),
  close:require('../assets/actions/close.jpg'),play:require('../assets/actions/play.jpg'),pause:require('../assets/actions/pause.jpg'),refresh:require('../assets/actions/refresh.jpg'),
  help:require('../assets/actions/help.jpg'),approve:require('../assets/actions/approve.jpg'),reject:require('../assets/actions/reject.jpg'),scrapbook:require('../assets/actions/scrapbook.jpg'),
  split:require('../assets/actions/split.jpg'),remember:require('../assets/actions/remember.png'),add:require('../assets/actions/add.jpg'),
  scan:require('../assets/characters/billiam-bill-scanner.png'),banking:require('../assets/characters/plaid-bank-daddy-tate.png'),
  debt:require('../assets/characters/header-debt-bobbie-tate.png'),savings:require('../assets/characters/header-savings-westley-bobbie.png'),
  budget:require('../assets/characters/header-budget-daddy-chapo.png'),subscriptions:require('../assets/characters/bobbie-premium-clubhouse.png'),
  security:require('../assets/characters/security-screen-approved.png'),community:require('../assets/characters/facebook-moving-day.jpg'),
  feedback:require('../assets/characters/daddy-neighborhood-feedback.png'),calm:require('../assets/characters/header-calm-bobbie-yoga.png'),mail:require('../assets/characters/header-bills-billiam-westley.png'),
  smallStep:require('../assets/characters/showing-up-counts-westley-tate.jpg'),
  firstWin:require('../assets/characters/feature-first-win.png'),
  payday:require('../assets/characters/feature-until-payday.png'),
  calendar:require('../assets/characters/snapshot-extra-check.png'),
  savingsGoal:require('../assets/characters/savings-goals-button-chapo.png'),
  paymentHistory:require('../assets/characters/feature-payment-history.png'),
  quiet:require('../assets/characters/feature-quiet-mode.png'),
  overwhelmed:require('../assets/characters/overwhelmed-westley-cozy.jpg'),
  reviewBills:require('../assets/characters/sample-bills-westley-mailman.png'),
  neighborhood:require('../assets/characters/neighborhood-panorama-day.png'),
  mailbox:require('../assets/characters/billiam-mailbox.png'),
  billTools:require('../assets/characters/billiam-canonical.png'),
  welcome:require('../assets/characters/annie-front-door-mailbox.png'),
  annieCare:require('../assets/characters/annie-pearl-01.png'),
  anniePoster:require('../assets/characters/annie-pearl-02.png'),
});
export default function ActionArtwork({action='browse',size=112}) {
  return <Image source={ACTION_ARTWORK[action]||ACTION_ARTWORK.browse} resizeMode="contain" accessible={false} importantForAccessibility="no" pointerEvents="none" style={{width:size,height:size,borderRadius:12,flexShrink:0}}/>;
}
