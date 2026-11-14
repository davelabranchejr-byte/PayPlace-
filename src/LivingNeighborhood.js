import { EncouragementSpot } from './Encouragement';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, Image, Pressable, ScrollView, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FittedArtwork from './FittedArtwork';
import { RoomDestinations } from './InteractiveRoom';
import { Text } from './Privacy';
import { isNeighborhoodNight, neighborhoodSeasonalCameos, neighborhoodWelcomeTheme, neighborhoodWelcomeLocations } from './neighborhood-time.mjs';
import useNeighborhoodClock from './useNeighborhoodClock';
import useNeighborhoodWeather from './useNeighborhoodWeather';
import { NeighborhoodEffects, NeighborhoodWalkers, TownLife } from './NeighborhoodWorld';
import { isNeighborhoodLeafSeason, neighborhoodResidents, neighborhoodWalkers, neighborhoodWeatherNames, seasonalNeighborhoodWeather } from './neighborhood-world.mjs';
const day=require('../assets/characters/neighborhood-panorama-day.png');
const night=require('../assets/characters/neighborhood-panorama-night.png');
const butterfly=require('../assets/characters/monarch-butterfly.png');
const decorations = {
  spring: require('../assets/characters/seasonal/decor-spring.png'),
  summer: require('../assets/characters/seasonal/decor-summer.png'),
  autumn: require('../assets/characters/seasonal/decor-autumn.png'),
  winter: require('../assets/characters/seasonal/decor-winter.png'),
  easter: require('../assets/characters/seasonal/decor-easter.png'),
  'independence-day': require('../assets/characters/seasonal/decor-independence-day.png'),
  halloween: require('../assets/characters/seasonal/decor-halloween.png'),
  'winter-holidays': require('../assets/characters/seasonal/decor-winter-holidays.png'),
};
const seasonDecor = { easter: 'spring', 'independence-day': 'summer', thanksgiving: 'autumn',
  halloween: 'autumn', 'winter-holidays': 'winter', 'new-year': 'winter' };
const holidayDecor = { 'new-year': 'winter-holidays' };

function MapDecorations({ theme, dark }) {
  const seasonal = seasonDecor[theme] ?? theme;
  return <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants"
    style={[StyleSheet.absoluteFillObject, { opacity: dark ? 0.84 : 1 }]}>
    {[[3, 75], [30, 79], [50, 81], [89, 77]].map(([left, top]) =>
      <Image key={left} source={decorations[seasonal]} resizeMode="contain" style={[s.decor, { left: `${left}%`, top: `${top}%` }]} />)}
    {seasonDecor[theme] && [13, 45, 87].map(left =>
      <Image key={left} source={decorations[holidayDecor[theme] ?? theme] ?? decorations[seasonal]}
        resizeMode="contain" style={[s.decor, { left: `${left}%`, top: '75%' }]} />)}
  </View>;
}
const lamps=[[3,32],[10.4,25],[30.6,24],[48.6,34],[65.2,31],[80.2,17],[95.4,36]];
const flies=[[19,61],[28,72],[36,51],[44,77],[54,66],[61,55],[70,76],[80,61]];
function Glow({x,y,index,playing,firefly=false}) {
  const alpha=useRef(new Animated.Value(0.6)).current;
  const drift=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    alpha.setValue(firefly?0.45:0.65);drift.setValue(0);
    if(!playing)return undefined;
    const blink=Animated.loop(Animated.sequence([
      Animated.delay(index*173),
      Animated.timing(alpha,{toValue:firefly?0.02:0.4,duration:1400+index*61,useNativeDriver:true}),
      Animated.timing(alpha,{toValue:firefly?0.95:0.85,duration:900+index*91,useNativeDriver:true}),
    ]));
    const wander=Animated.loop(Animated.sequence([
      Animated.timing(drift,{toValue:1,duration:2700+index*83,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
      Animated.timing(drift,{toValue:0,duration:3100+index*71,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
    ]));
    blink.start();if(firefly)wander.start();
    return ()=>{blink.stop();wander.stop();};
  },[playing,firefly,index,alpha,drift]);
  return <Animated.View style={[s.glow,{left:`${x}%`,top:`${y}%`,opacity:alpha,
    transform:[{translateX:firefly?drift.interpolate({inputRange:[0,1],outputRange:[-5,9]}):0},
      {translateY:firefly?drift.interpolate({inputRange:[0,1],outputRange:[3,-7]}):0}]}]}>
    <View style={[s.halo,firefly&&s.flyHalo]}/>
    {firefly&&<><View style={s.wingLeft}/><View style={s.wingRight}/><View style={s.flyBody}/><View style={s.flyLight}/></>}
  </Animated.View>;
}
function Butterfly({width,index,playing}) {
  const flight=useRef(new Animated.Value(0)).current;
  const flap=useRef(new Animated.Value(1)).current;
  useEffect(()=>{
    flight.setValue(0);flap.setValue(1);
    if(!playing||!width)return undefined;
    const glide=Animated.loop(Animated.sequence([
      Animated.delay(index*2100),
      Animated.timing(flight,{toValue:1,duration:14500+index*3700,easing:Easing.linear,useNativeDriver:true}),
      Animated.delay(1100),
    ]));
    const wings=Animated.loop(Animated.sequence([
      Animated.timing(flap,{toValue:0.22,duration:170+index*35,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
      Animated.timing(flap,{toValue:1,duration:200+index*30,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
    ]));
    glide.start();wings.start();return ()=>{glide.stop();wings.stop();};
  },[width,index,playing,flight,flap]);
  return <Animated.View style={{position:'absolute',top:`${index?43:21}%`,left:playing?0:`${index?72:24}%`,
    transform:[{translateX:playing?flight.interpolate({inputRange:[0,1],outputRange:index?[width+35,-35]:[-35,width+35]}):0},
      {translateY:flight.interpolate({inputRange:[0,0.2,0.45,0.7,1],outputRange:[0,-9,6,-5,0]})},
      {rotate:flight.interpolate({inputRange:[0,0.3,0.7,1],outputRange:['-18deg','12deg','-10deg','16deg']})}]}}>
    <Animated.Image source={butterfly} resizeMode="contain" accessible={false}
      style={{width:index?23:29,height:index?23:29,transform:[{scaleX:flap}]}}/>
  </Animated.View>;
}
function Waterfall({ playing }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    shimmer.setValue(0);
    if (!playing) return;
    const flow = Animated.loop(Animated.sequence([
      Animated.timing(shimmer, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(shimmer, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    flow.start();
    return () => flow.stop();
  }, [playing, shimmer]);
  return <Animated.View style={[s.water, {
    opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0, 0.42] }),
    transform: [{ translateY: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) }],
  }]} />;
}

const skyPasses = {
  airplane: { wait: 4500, duration: 6800, rest: 17000, x: 0.35, y: -0.014 },
  'shooting-star': { wait: 7200, duration: 1050, rest: 25000, x: -0.19, y: 0.084 },
  saucer: { wait: 16000, duration: 4200, rest: 54000, x: 0.23, y: -0.035 },
  santa: { wait: 11000, duration: 6600, rest: 36000, x: 0.30, y: -0.035,
    source: require('../assets/characters/cameo-santa.png'), width: 62, height: 27 },
  witches: { wait: 10500, duration: 5200, rest: 36500, x: -0.24, y: 0.033,
    source: require('../assets/characters/cameo-witches.png'), width: 49, height: 28 },
  cashper: { wait: 18500, duration: 5000, rest: 53000, x: 0.16, y: -0.052,
    source: require('../assets/characters/cameo-cashper.png'), width: 28, height: 32, bob: 4 },
  bunny: { wait: 8500, duration: 5300, rest: 37500, x: 0.15, y: 0,
    source: require('../assets/characters/cameo-bunny.png'), width: 35, height: 34, bob: 6 },
  turkey: { wait: 9000, duration: 5400, rest: 38000, x: 0.11, y: 0.012,
    source: require('../assets/characters/cameo-turkey.png'), width: 35, height: 35, bob: 2 },
};

function ScenePass({ kind, width }) {
  const travel = useRef(new Animated.Value(0)).current;
  const flight = skyPasses[kind];
  useEffect(() => {
    const pass = Animated.loop(Animated.sequence([
      Animated.delay(flight.wait),
      Animated.timing(travel, {
        toValue: 1, duration: flight.duration, easing: Easing.linear, useNativeDriver: true,
      }),
      Animated.delay(flight.rest),
    ]), { resetBeforeIteration: true });
    pass.start();
    return () => pass.stop();
  }, [flight, travel]);

  const rise = width * flight.y;
  const vertical = flight.bob ? travel.interpolate({
    inputRange: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
    outputRange: Array.from({ length: 9 }, (_, step) => rise * step / 8 - (step % 2 ? flight.bob : 0)),
  }) : travel.interpolate({ inputRange: [0, 1], outputRange: [0, rise] });
  return <Animated.View testID={`neighborhood-${kind}`}
    style={[s.skyPass, s[kind], {
      opacity: travel.interpolate({ inputRange: [0, 0.2, 0.73, 1], outputRange: [0, 0.92, 0.92, 0] }),
      transform: [
        { translateX: travel.interpolate({ inputRange: [0, 1], outputRange: [0, width * flight.x] }) },
        { translateY: vertical },
      ],
    }]}>
    {flight.source && <Image source={flight.source} resizeMode="contain" accessible={false}
      style={{ width: flight.width, height: flight.height }} />}
    {kind === 'shooting-star' && <View style={s.star}>
      <View style={s.starHead} />
      <View style={s.starTrail} />
      <View style={s.starTail} />
    </View>}
    {kind === 'airplane' && <Ionicons name="airplane" size={15} color="#FFFDF4" style={s.plane} />}
    {kind === 'saucer' && <View style={s.saucerShape}>
      <View style={s.saucerDome} />
      <View style={s.saucerRim}>
        {[0, 1, 2].map(light => <View key={light} style={s.saucerLight} />)}
      </View>
    </View>}
  </Animated.View>;
}

const landmarks = [
  { id: 'Billiam', label: 'Tap the mailbox to visit Billiam', caption: 'Billiam’s Mailbox', x: 27, y: 74 },
  { id: 'Calm', label: 'Tap the bridge to visit Calm Garden', caption: 'Calm Garden', x: 54, y: 78 },
];

const treehouses = [
  { id: 'Westley', caption: 'Westley’s Den', x: 11, y: 65 },
  { id: 'Tate', caption: 'Tate’s Hangout', x: 22, y: 40 },
  { id: 'Chapo', caption: 'Chapo’s Kitchen', x: 72, y: 61 },
  { id: 'Annie', caption: 'Annie’s House', x: 83, y: 43 },
  { id: 'Bobbie', caption: 'Bobbie’s Boutique', x: 93, y: 78 },
  { id: 'Cabaret', caption: 'Bobbie’s Cabaret', x: 80.5, y: 77, captionY: 91 },
  { id: 'Daddy', caption: 'Daddy’s House', x: 39, y: 73, captionY: 88 },
  { id: 'Spa', caption: 'Em’s Pet Spa', x: 65, y: 79, captionY: 93 },
];

export function NeighborhoodTownLife({ weatherZip, weather, onWeatherZip, onOpen }) {
  const now = useNeighborhoodClock();
  return <TownLife residents={neighborhoodResidents(now)} zip={weatherZip} weather={weather}
    weatherKind={weather?.kind || seasonalNeighborhoodWeather(now)} leaves={isNeighborhoodLeafSeason(now)}
    onOpen={onOpen} onWeatherZip={onWeatherZip} />;
}

export default function LivingNeighborhood({ reduceAnimation = false, paused = false, onOpen, weatherZip, sharedWeather, showTreehouses = false, fullMap = false, mapOnly = false, onMeet, openingTheme }) {
  const now = useNeighborhoodClock();
  const localWeather = useNeighborhoodWeather(mapOnly ? undefined : weatherZip);
  const weather = mapOnly ? sharedWeather : localWeather;
  const weatherKind = weather?.kind || seasonalNeighborhoodWeather(now);
  const leaves = isNeighborhoodLeafSeason(now);
  const residents = neighborhoodResidents(now);
  const [reduce,setReduce]=useState(true);
  const [active,setActive]=useState(AppState.currentState==='active');
  const scroll = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [offset, setOffset] = useState(0);
  const [{ width, height }, setBounds] = useState({ width: 0, height: 0 });
  useEffect(()=>{
    let mounted=true;
    AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(mounted)setReduce(value);}).catch(()=>{});
    const motion=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduce);
    const app=AppState.addEventListener('change',state=>setActive(state==='active'));
    return ()=>{mounted=false;motion.remove();app.remove();};
  },[]);
  const dark=isNeighborhoodNight(now);
  const theme = neighborhoodWelcomeTheme(now);
  const hour = now.getHours();
  const lateNight = dark && (hour >= 23 || hour < 5);
  const seasonalCameos = neighborhoodSeasonalCameos(now, dark);
  const walkers = neighborhoodWalkers(residents, now);
  const playing=active&&!reduce&&!reduceAnimation&&!paused;
  const fittedWidth = viewportHeight > 0 ? Math.min(viewportWidth, viewportHeight * 3) : viewportWidth;
  const panWidth = Math.min(viewportWidth * (mapOnly ? 2.65 : 1.85), mapOnly ? 1150 : 960);
  const sceneWidth = fullMap ? fittedWidth : Math.max(viewportWidth, panWidth);
  const scrollEnd = Math.max(0, sceneWidth - viewportWidth);
  useEffect(() => {
    if (fullMap) { setOffset(0); scroll.current?.scrollTo({ x: 0, animated: false }); }
  }, [fullMap]);
  useEffect(() => {
    if (!openingTheme || !scrollEnd || fullMap) return undefined;
    const focus = neighborhoodWelcomeLocations[openingTheme] ?? 0.5;
    const x = Math.max(0, Math.min(scrollEnd, sceneWidth * focus - viewportWidth / 2));
    const frame = setTimeout(() => scroll.current?.scrollTo({ x, animated: false }), 0);
    return () => clearTimeout(frame);
  }, [openingTheme, scrollEnd, sceneWidth, viewportWidth, fullMap]);
  const shownOffset = Math.min(offset, scrollEnd);
  const move = direction => scroll.current?.scrollTo({
    x: Math.max(0, Math.min(scrollEnd, shownOffset + direction * viewportWidth * 0.55)),
    animated: !reduce && !reduceAnimation,
  });
  const timeDescription = dark ? 'PayPlace at night with lanterns and fireflies.' : 'PayPlace by day with butterflies.';
  const description = `${timeDescription} ${neighborhoodWeatherNames[weatherKind]}${weather?.label ? ` in ${weather.label}` : ''}.`;
  const destinations = showTreehouses ? [...landmarks, ...treehouses] : landmarks;
  return <>
  <View style={[s.viewport, mapOnly && s.mapViewport]} onLayout={({ nativeEvent: { layout } }) => {
    setViewportWidth(layout.width);
    setViewportHeight(layout.height);
  }} testID="neighborhood-panorama-viewport">
  <ScrollView ref={scroll} horizontal nestedScrollEnabled directionalLockEnabled showsHorizontalScrollIndicator={false}
    scrollEnabled={!fullMap} contentContainerStyle={mapOnly ? s.mapCenter : undefined}
    accessibilityLabel={description} scrollEventThrottle={32} onScroll={event => setOffset(Math.max(0, event.nativeEvent.contentOffset.x))}
    testID="neighborhood-panorama-scroll">
  <FittedArtwork accessible={false} source={dark?night:day} style={[s.scene, sceneWidth > 0 && { width: sceneWidth }]} aspectRatio={3} testID="neighborhood-panorama-artwork" onLayout={({ nativeEvent: { layout } }) => setBounds(previous => previous.width === layout.width && previous.height === layout.height
      ? previous : { width: layout.width, height: layout.height })}
    accessibilityLabel={description}>
    {mapOnly && <MapDecorations theme={theme} dark={dark} />}
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFillObject}>
      <Waterfall playing={playing} />
      {playing && width > 0 && <>
        <ScenePass key={dark ? 'night' : 'day'} kind={dark ? 'shooting-star' : 'airplane'} width={width} />
        {lateNight && <ScenePass kind="saucer" width={width} />}
        {seasonalCameos.map(kind => <ScenePass key={kind} kind={kind} width={width} />)}
      </>}
      {dark?<>
        {lamps.map(([x,y],index)=><Glow key={`lamp-${index}`} x={x} y={y} index={index} playing={playing}/>)}
        {flies.map(([x,y],index)=><Glow key={`fly-${index}`} x={x} y={y} index={index} playing={playing} firefly/>)}
      </>:[0,1].map(index=><Butterfly key={index} index={index} width={width} playing={playing}/>)}
      <NeighborhoodEffects weather={weatherKind} {...{leaves, dark, playing, width, height}} />
    </View>
    {onOpen && <RoomDestinations destinations={destinations.map(({ id, label, caption, x, y, captionY }) => ({
      label: label || `Visit ${caption} from the map`, caption: fullMap ? undefined : caption, open: () => onOpen(id),
      area: { ...(fullMap ? s.quietLandmark : captionY ? s.paintedLandmark : s.landmark),
        left: `${x}%`, top: fullMap || !captionY ? `${y}%` : `${y - 11}%`,
        ...(!fullMap && captionY && { height: `${captionY - y + 11}%` }) },
    }))} />}
    <EncouragementSpot place="town" style={{ left: '73%' }} />
    <NeighborhoodWalkers {...{ walkers, playing, width, height, onMeet }} />
  </FittedArtwork>
  </ScrollView>
  </View>
  {!mapOnly && <View style={s.mapControls}>
    <Text style={s.hint}>{neighborhoodWeatherNames[weatherKind]}{scrollEnd > 1 ? ' · Swipe to explore' : ''}</Text>
    {scrollEnd > 1 && <View style={s.arrows}>
      <PanButton direction="left" disabled={shownOffset < 1} onPress={() => move(-1)} />
      <PanButton direction="right" disabled={shownOffset >= scrollEnd - 1} onPress={() => move(1)} />
    </View>}
  </View>}
  </>;
}

function PanButton({ direction, disabled, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Pan neighborhood ${direction}`}
    accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.arrow, disabled && s.arrowDisabled]}>
    <Ionicons name={`chevron-${direction}`} size={21} color="#4F2676" accessible={false} />
  </Pressable>;
}

const s=StyleSheet.create({
  viewport: { borderRadius: 18, overflow: 'hidden', backgroundColor: '#173C50' },
  mapViewport: { flex: 1, borderRadius: 0 },
  mapCenter: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  scene: { backgroundColor: '#173C50' },
  decor: { position: 'absolute', width: '9%', height: '24%' },
  mapControls: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5, marginBottom: 10 },
  arrows: { flexDirection: 'row', gap: 6 },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14,
    backgroundColor: '#E9D4FF', borderWidth: 1, borderColor: '#9E75C1' },
  arrowDisabled: { opacity: 0.42 },
  landmark: { width: 110, height: 48, justifyContent: 'center', padding: 0, transform: [{ translateX: -55 }, { translateY: -24 }] },
  paintedLandmark: { width: 110, transform: [{ translateX: -55 }] },
  quietLandmark: { width: 48, height: 48, transform: [{ translateX: -24 }, { translateY: -24 }] },
  water: { position: 'absolute', left: '49.5%', top: '72%', width: '9%', height: '3.5%', borderRadius: 6, backgroundColor: '#C9F4FF' },
  hint: { flex: 1, fontSize: 13, color: '#34465E' },
  skyPass: { position: 'absolute' },
  airplane: { left: '32%', top: '16%' },
  plane: { textShadowColor: '#26425F99', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
    transform: [{ rotate: '30deg' }] },
  'shooting-star': { left: '61%', top: '12%' },
  star: { flexDirection: 'row', alignItems: 'center', transform: [{ rotate: '-24deg' }] },
  starHead: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF8D5' },
  starTrail: { width: 10, height: 2, backgroundColor: '#E7F1FFBA' },
  starTail: { width: 8, height: 1, borderRadius: 1, backgroundColor: '#B8D4FF55' },
  santa: { left: '30%', top: '19%' },
  witches: { left: '60%', top: '12%' },
  cashper: { left: '36%', top: '60%' },
  bunny: { left: '39%', bottom: '1%' },
  turkey: { left: '42%', bottom: '5%' },
  saucer: { left: '38%', top: '26%' },
  saucerShape: { alignItems: 'center', transform: [{ rotate: '-10deg' }] },
  saucerDome: { width: 9, height: 5, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: '#B1FFE9' },
  saucerRim: { width: 22, height: 6, borderRadius: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly',
    backgroundColor: '#C7B6FF', borderWidth: 1, borderColor: '#7D75BC' },
  saucerLight: { width: 2, height: 2, borderRadius: 1, backgroundColor: '#FFF2A5' },
  glow:{position:'absolute',width:24,height:24,marginLeft:-12,marginTop:-12,alignItems:'center',justifyContent:'center'},
  halo:{position:'absolute',width:24,height:24,borderRadius:12,backgroundColor:'#FFCD5C33',shadowColor:'#FFD36C',shadowOpacity:0.9,shadowRadius:9,shadowOffset:{width:0,height:0}},
  flyHalo:{width:10,height:10,borderRadius:5,backgroundColor:'#C5FA6933',shadowColor:'#D4FF74',shadowRadius:5},
  flyBody:{position:'absolute',width:1.5,height:4,borderRadius:1,backgroundColor:'#665439'},
  wingLeft:{position:'absolute',width:3,height:1.5,backgroundColor:'#EEEBC477',borderRadius:2,transform:[{translateX:-2},{rotate:'-20deg'}]},
  wingRight:{position:'absolute',width:3,height:1.5,backgroundColor:'#EEEBC477',borderRadius:2,transform:[{translateX:2},{rotate:'20deg'}]},
  flyLight:{position:'absolute',width:2.5,height:2.5,borderRadius:2,backgroundColor:'#E5FF94',transform:[{translateY:2}]},
});
