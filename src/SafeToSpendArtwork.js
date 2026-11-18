import React, { useEffect, useRef, useState } from 'react';
import FittedArtwork from './FittedArtwork';

const scenes = {
  finances: [
    require('../assets/characters/safe-to-spend-bill-day.jpg'),
    require('../assets/characters/safe-to-spend-breakfast.jpg'),
  ],
  map: [
    require('../assets/characters/safe-to-spend-porch.jpg'),
    require('../assets/characters/safe-to-spend-rainy-day.jpg'),
  ],
  budget: [require('../assets/characters/safe-to-spend-budget-workshop.jpg')],
};
const nextScene = { finances: 0, map: 0, budget: 0 };

export default function SafeToSpendArtwork({ placement, style, testID }) {
  const selected = useRef(null);
  const [source, setSource] = useState(null);

  useEffect(() => {
    if (selected.current?.placement !== placement) {
      const collection = scenes[placement];
      const index = nextScene[placement];
      selected.current = { placement, source: collection[index] };
      nextScene[placement] = (index + 1) % collection.length;
    }
    setSource(selected.current.source);
  }, [placement]);

  return <FittedArtwork source={source || scenes[placement][0]} resizeMode="contain"
    style={style} testID={testID} accessible={false} />;
}
