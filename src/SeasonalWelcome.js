import React from 'react';
import { StyleSheet } from 'react-native';
import FittedArtwork from './FittedArtwork';
import { neighborhoodWelcomeTheme } from './neighborhood-time.mjs';
import useNeighborhoodClock from './useNeighborhoodClock';
const scenes = {
  spring:require('../assets/characters/annie-welcome-home-spring.png'),
  summer:require('../assets/characters/annie-welcome-home-summer.png'),
  autumn:require('../assets/characters/annie-welcome-home-autumn.png'),
  winter:require('../assets/characters/annie-welcome-home-winter.png'),
  halloween:require('../assets/characters/annie-welcome-home-halloween.png'),
  'winter-holidays':require('../assets/characters/annie-welcome-home-winter-holidays.png'),
};
export default function SeasonalWelcome() {
  const theme = neighborhoodWelcomeTheme(useNeighborhoodClock());
  return <FittedArtwork source={scenes[theme]} style={s.art} aspectRatio={1672/941} testID="seasonal-welcome-artwork"
    accessibilityLabel={`Welcome home! Annie welcomes Daddy, Billiam, Bobbie, Chapo, Westley and Tate. ${theme === 'halloween' ? 'Trick or treat! Everyone wears vintage masks of one another.' : theme === 'winter-holidays' ? 'A festive December holiday welcome.' : `A cozy ${theme} welcome.`}`} />;
}
const s=StyleSheet.create({art:{borderRadius:18,marginBottom:12}});
