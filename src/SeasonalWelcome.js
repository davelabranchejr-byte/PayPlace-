import React from 'react';
import { Image, StyleSheet } from 'react-native';
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
  return <Image source={scenes[theme]} style={s.art} resizeMode="contain" accessible accessibilityRole="image"
    accessibilityLabel={`Welcome home! Annie welcomes Daddy, Billiam, Bobbie, Chapo, Westley and Tate. ${theme === 'halloween' ? 'Trick or treat! Everyone wears vintage masks of one another.' : theme === 'winter-holidays' ? 'A festive December holiday welcome.' : `A cozy ${theme} welcome.`}`} />;
}
const s=StyleSheet.create({art:{width:'100%',aspectRatio:1672/941,borderRadius:18,marginBottom:12}});
