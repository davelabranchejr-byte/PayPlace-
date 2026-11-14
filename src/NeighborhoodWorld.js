import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import CharacterArtwork from './CharacterArtwork';
import { portraits } from './characters';
import ExpandableSection from './ExpandableSection';
import { Text, TextInput } from './Privacy';
import { isWeatherZip } from './neighborhood-local-weather.mjs';
import { neighborhoodResidents, neighborhoodWeatherNames } from './neighborhood-world.mjs';
import useNeighborhoodClock from './useNeighborhoodClock';

const sprites = {
  daddy: require('../assets/characters/town-daddy.png'),
  billiam: require('../assets/characters/town-billiam.png'),
  em: require('../assets/characters/town-em.png'),
};

function ResidentArt({ id, size }) {
  const style = { width: size, height: size };
  if (sprites[id]) return <Image source={sprites[id]} resizeMode="contain" accessible={false} style={style} />;
  return <View style={[s.portraitFrame, style]} accessible={false} importantForAccessibility="no-hide-descendants">
    <CharacterArtwork source={portraits[id]} style={style} resizeMode="cover" />
  </View>;
}

export function RoomVisitors({ destination }) {
  const now = useNeighborhoodClock();
  const visitors = neighborhoodResidents(now).filter(resident => resident.destination === destination);
  if (!visitors.length) return null;
  return <View style={s.visitors} testID="room-visitors">
    <Text accessibilityRole="header" style={s.name}>Here now</Text>
    {visitors.map(resident => <View key={resident.id} style={s.resident}>
      <ResidentArt id={resident.id} size={48} />
      <View style={s.copy}>
        <Text style={s.name}>{resident.name}</Text>
        <Text style={s.detail}>{resident.activity}</Text>
      </View>
    </View>)}
  </View>;
}

const routes = {
  left: [0.43, 0.96, 0.29, 0.84],
  bridge: [0.47, 0.96, 0.56, 0.85],
  right: [0.62, 0.89, 0.73, 0.77],
};

function Walker({ resident, width, height, index, onMeet }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [walking, setWalking] = useState(false);
  useEffect(() => {
    let stopped = false;
    let wait;
    let travel;
    function walk() {
      progress.setValue(0);
      setWalking(true);
      travel = Animated.timing(progress, { toValue: 1, duration: 9200, easing: Easing.linear, useNativeDriver: true });
      travel.start(({ finished }) => {
        if (!finished || stopped) return;
        setWalking(false);
        wait = setTimeout(walk, 10500 + index * 2000);
      });
    }
    wait = setTimeout(walk, index * 1000);
    return () => { stopped = true; clearTimeout(wait); travel?.stop(); };
  }, [index, progress]);

  if (!walking) return null;
  const route = routes[resident.path];
  // Walkers on the same route move in the same direction.
  const [startX, startY, endX, endY] = resident.path === 'left'
    ? [route[2], route[3], route[0], route[1]] : route;
  const size = sprites[resident.id] ? 34 : 28;
  const artwork = <View style={{ transform: [{ scaleX: sprites[resident.id] && resident.id !== 'billiam' && startX > endX ? -1 : 1 }] }}>
    <ResidentArt id={resident.id} size={size} />
  </View>;
  return <Animated.View pointerEvents={onMeet ? "box-none" : "none"}
    testID={`town-walker-${resident.id}`} style={[s.walker, {
    opacity: progress.interpolate({ inputRange: [0, 0.10, 0.90, 1], outputRange: [0.25, 1, 1, 0.25] }),
    transform: [
      { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [width * startX - size / 2, width * endX - size / 2] }) },
      { translateY: progress.interpolate({
        inputRange: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
        outputRange: Array.from({ length: 9 }, (_, step) => (startY + (endY - startY) * step / 8) * height - size - (step % 2 ? 1.8 : 0)),
      }) },
    ],
  }]}>
    {onMeet ? <Pressable style={s.walkerTarget} hitSlop={4} accessibilityRole="button"
      accessibilityLabel={`${resident.name}, ${resident.job}. ${resident.activity}`} onPress={() => onMeet(resident)}>
      {artwork}
    </Pressable> : artwork}
  </Animated.View>;
}

export function NeighborhoodWalkers({ walkers, playing, width, height, onMeet }) {
  return playing && width > 0 && height > 0
    ? walkers.map((resident, index) => <Walker key={`${resident.id}-${resident.path}`} {...{ resident, width, height, index, onMeet }} />)
    : null;
}

const particles = {
  rain: { count: 20, duration: 850, drift: 12 },
  snow: { count: 14, duration: 5300, drift: 16 },
  leaves: { count: 7, duration: 6900, drift: 28 },
};
const leafColors = ['#F4AB36', '#DB693B', '#C9514B', '#F7CE64'];

function FallingWeather({ kind, width, height }) {
  const progress = useRef(new Animated.Value(0)).current;
  const effect = particles[kind];
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(progress, { toValue: 1, duration: effect.duration, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [effect, progress]);

  return <View testID={`town-weather-${kind}`} pointerEvents="none" style={StyleSheet.absoluteFillObject}>
    {Array.from({ length: effect.count }, (_, index) => {
      const phase = (index * 0.618) % 1;
      const fall = Animated.modulo(Animated.add(progress, phase), 1);
      const x = (((index * 0.381) + 0.03) % 1) * width;
      return <Animated.View key={index} style={[s.particle, s[kind], {
        left: x,
        ...(kind === 'leaves' ? { backgroundColor: leafColors[index % leafColors.length] } : {}),
        opacity: fall.interpolate({ inputRange: [0, 0.13, 0.86, 1], outputRange: [0, 0.77, 0.77, 0] }),
        transform: [
          { translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [-12, height + 5] }) },
          { translateX: fall.interpolate({ inputRange: [0, 0.4, 0.7, 1], outputRange: [0, effect.drift * 0.6, effect.drift * 0.35, effect.drift] }) },
          { rotate: kind === 'rain' ? '-14deg' : fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
        ],
      }]} />;
    })}
  </View>;
}

export function NeighborhoodEffects({ weather, leaves, dark, playing, width, height }) {
  const overcast = weather !== 'clear';
  return <>
    {overcast && <View testID={`town-weather-tint-${weather}`} style={[StyleSheet.absoluteFillObject, {
      backgroundColor: weather === 'snow' ? '#C3E5F750' : dark ? '#19233760' : weather === 'rain' ? '#22344F75' : '#31445A42',
    }]} />}
    {playing && width > 0 && height > 0 && <>
      {particles[weather] && <FallingWeather key={weather} kind={weather} width={width} height={height} />}
      {leaves && weather !== 'snow' && <FallingWeather kind="leaves" width={width} height={height} />}
    </>}
  </>;
}

export function TownLife({ residents, onOpen, zip, onWeatherZip, weather, weatherKind, leaves }) {
  const [draft, setDraft] = useState(zip || '');
  const status = weather?.label
    ? `${weather.label} · ${neighborhoodWeatherNames[weatherKind]} · ${weather.source === 'observation' ? 'NWS observation' : 'NWS hourly forecast'}`
    : zip ? (weather === null ? 'Local weather unavailable · seasonal weather shown' : 'Checking local weather · seasonal weather shown')
      : `Seasonal weather · ${neighborhoodWeatherNames[weatherKind]}`;
  return <>
    <ExpandableSection title="Around town" compact>
      {residents.map(resident => <Pressable key={resident.id} accessibilityRole="button"
        accessibilityLabel={`${resident.name}, ${resident.job}. ${resident.activity}. Visit ${resident.place}`}
        onPress={() => onOpen(resident.destination)} style={s.resident}>
        <ResidentArt id={resident.id} size={39} />
        <View style={s.copy}>
          <Text style={s.name}>{resident.name} · {resident.job}</Text>
          <Text style={s.detail}>{resident.activity} · {resident.place}</Text>
          {resident.companions.length > 0 && <Text style={s.detail}>With {resident.companions.join(', ')}</Text>}
        </View>
        <Text accessible={false} style={s.chevron}>›</Text>
      </Pressable>)}
    </ExpandableSection>
    <ExpandableSection title="Neighborhood weather" compact>
      <View style={s.settings}>
        <Text style={s.name}>{status}{leaves && weatherKind !== 'snow' ? ' · Falling leaves' : ''}</Text>
        <Text style={s.detail}>Optional. PayPlace sends your U.S. ZIP code to Zippopotam.us and the approximate coordinates to the National Weather Service.</Text>
        <TextInput value={draft} onChangeText={setDraft} accessibilityLabel="U.S. ZIP code for neighborhood weather"
          placeholder="Five-digit U.S. ZIP code" autoComplete="off" keyboardType="number-pad" maxLength={5} style={s.input} />
        <Pressable accessibilityRole="button" accessibilityState={{disabled: !isWeatherZip(draft) || draft === zip}}
          disabled={!isWeatherZip(draft) || draft === zip} onPress={() => onWeatherZip(draft)} style={[s.button, (!isWeatherZip(draft) || draft === zip) && s.disabled]}>
          <Text style={s.buttonLabel}>Use ZIP for weather</Text>
        </Pressable>
        {zip && <Pressable accessibilityRole="button" onPress={() => { setDraft(''); onWeatherZip(''); }} style={s.button}>
          <Text style={s.buttonLabel}>Use seasonal weather</Text>
        </Pressable>}
      </View>
    </ExpandableSection>
  </>;
}

const s = StyleSheet.create({
  walker: { position: 'absolute', top: 0, left: 0 },
  visitors: { backgroundColor: '#FFF0BD', borderRadius: 18, padding: 12 },
  walkerTarget: { alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute', top: 0 },
  rain: { width: 1.4, height: 12, backgroundColor: '#BCE1FF', borderRadius: 1 },
  snow: { width: 4, height: 4, backgroundColor: '#FFFDF4', borderRadius: 3 },
  leaves: { width: 6, height: 4, borderTopLeftRadius: 4, borderBottomRightRadius: 4, borderWidth: 0.5, borderColor: '#754626' },
  resident: { minHeight: 52, flexDirection: 'row', alignItems: 'center', padding: 6, gap: 9, borderBottomWidth: 1, borderBottomColor: '#E4D8F1' },
  portraitFrame: { overflow: 'hidden', borderRadius: 30, borderColor: '#FFF2BE', borderWidth: 1.5, backgroundColor: '#EFE3FF' },
  copy: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800', color: '#173557' },
  detail: { fontSize: 13, lineHeight: 19, color: '#34465E' },
  chevron: { fontSize: 25, color: '#6550AF' },
  settings: { gap: 10, padding: 4 },
  input: { minHeight: 46, padding: 9, color: '#173557', borderColor: '#9E86BF', borderWidth: 1, borderRadius: 12, backgroundColor: 'white' },
  button: { minHeight: 44, justifyContent: 'center', borderRadius: 12, backgroundColor: '#E9D4FF', padding: 9 },
  disabled: { opacity: 0.55 },
  buttonLabel: { fontWeight: '800', color: '#3F245E' },
});
