import React from 'react';
import { Image } from 'react-native';
export const ACTION_ARTWORK = Object.freeze({
  save:require('../assets/actions/save.jpg'),edit:require('../assets/actions/edit.jpg'),remove:require('../assets/actions/remove.jpg'),browse:require('../assets/actions/browse.jpg'),
  close:require('../assets/actions/close.jpg'),play:require('../assets/actions/play.jpg'),pause:require('../assets/actions/pause.jpg'),refresh:require('../assets/actions/refresh.jpg'),
  help:require('../assets/actions/help.jpg'),approve:require('../assets/actions/approve.jpg'),reject:require('../assets/actions/reject.jpg'),scrapbook:require('../assets/actions/scrapbook.jpg'),
  split:require('../assets/actions/split.jpg'),remember:require('../assets/actions/remember.jpg'),add:require('../assets/actions/add.jpg'),
  scan:require('../assets/characters/billiam-bill-scanner.png'),banking:require('../assets/characters/plaid-bank-daddy-tate.png'),
  debt:require('../assets/characters/header-debt-bobbie-tate.png'),savings:require('../assets/characters/header-savings-westley-bobbie.png'),
  budget:require('../assets/characters/header-budget-daddy-chapo.png'),subscriptions:require('../assets/characters/bobbie-premium-clubhouse.png'),
  security:require('../assets/characters/security-screen-approved.png'),community:require('../assets/characters/facebook-moving-day.jpg'),
  feedback:require('../assets/characters/daddy-neighborhood-feedback.png'),calm:require('../assets/characters/header-calm-bobbie-yoga.png'),mail:require('../assets/characters/header-bills-billiam-westley.png'),
});
export default function ActionArtwork({action='browse',size=112}) {
  return <Image source={ACTION_ARTWORK[action]||ACTION_ARTWORK.browse} resizeMode="contain" accessible={false} importantForAccessibility="no" pointerEvents="none" style={{width:size,height:size,borderRadius:12,flexShrink:0}}/>;
}
