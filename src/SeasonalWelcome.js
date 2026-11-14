import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet } from 'react-native';
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
  easter: require('../assets/characters/seasonal/welcome-easter.jpg'),
  'independence-day': require('../assets/characters/seasonal/welcome-independence-day.jpg'),
  thanksgiving: require('../assets/characters/seasonal/welcome-thanksgiving.jpg'),
  'new-year': require('../assets/characters/seasonal/welcome-new-year.jpg'),
};
const labels = {
  easter: 'Easter morning at the stone bridge, with painted eggs and spring tulips.',
  'independence-day': 'Fourth of July on the treehouse boardwalk with red, white and blue bunting.',
  thanksgiving: 'Thanksgiving at the harvest table, surrounded by pumpkins and autumn leaves.',
  'new-year': 'New Year’s Eve at the lantern-lit bridge, with fireworks over the valley.',
  halloween: 'A Halloween welcome at Annie’s. Everyone wears vintage masks of one another.',
  'winter-holidays': 'A festive December holiday welcome at Annie’s.',
};

export default function SeasonalWelcome() {
  const theme = neighborhoodWelcomeTheme(useNeighborhoodClock());
  return <WelcomeArtwork theme={theme} />;
}

function WelcomeArtwork({ theme }) {
  return <FittedArtwork source={scenes[theme]} style={s.art} aspectRatio={1672 / 941} testID="seasonal-welcome-artwork"
    accessibilityLabel={labels[theme] ?? `Welcome home to PayPlace on a ${theme} day.`} />;
}

export function NeighborhoodOpening({ theme, reduceAnimation, onFinish }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let mounted = true;
    let timer;
    let animation;
    const begin = reduced => {
      if (!mounted) return;
      timer = setTimeout(() => {
        if (reduced) { onFinish(); return; }
        animation = Animated.timing(progress, { toValue: 1, duration: 720, useNativeDriver: true });
        animation.start(result => { if (mounted && result?.finished) onFinish(); });
      }, 1100);
    };
    AccessibilityInfo.isReduceMotionEnabled().then(systemReduced => begin(systemReduced || reduceAnimation), () => begin(true));
    return () => { mounted = false; clearTimeout(timer); animation?.stop(); };
  }, [onFinish, progress, reduceAnimation]);

  return <Animated.View testID="neighborhood-welcome-opening" style={[s.opening, {
    opacity: progress.interpolate({ inputRange: [0, 0.45, 1], outputRange: [1, 0.9, 0] }),
    transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) }],
  }]}>
    <Pressable style={s.skip} accessibilityRole="button" accessibilityLabel="Skip welcome and explore Home" onPress={onFinish}>
      <WelcomeArtwork theme={theme} />
    </Pressable>
  </Animated.View>;
}

const s = StyleSheet.create({
  art: { borderRadius: 18, marginBottom: 12 },
  opening: { ...StyleSheet.absoluteFillObject, zIndex: 1, backgroundColor: '#173C50', justifyContent: 'center' },
  skip: { width: '100%' },
});
