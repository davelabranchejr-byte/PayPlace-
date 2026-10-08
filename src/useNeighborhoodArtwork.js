import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { isNeighborhoodNight } from './neighborhood-time.mjs';

const day = require('../assets/characters/annie-red-door-village.png');
const night = require('../assets/characters/annie-red-door-village-night.png');

export default function useNeighborhoodArtwork() {
  const [isNight, setIsNight] = useState(isNeighborhoodNight);
  useEffect(() => {
    const refresh = () => setIsNight(isNeighborhoodNight());
    const timer = setInterval(refresh, 60000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  return { source: isNight ? night : day, isNight };
}
