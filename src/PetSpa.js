import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import { EncouragementSpot } from './Encouragement';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SPA_VISITS, nextSpaScene, spaCanPlay } from './spa-scenes.mjs';
import PayPlaceBrand from './PayPlaceBrand';
import ContainedIllustration from './ContainedIllustration';
import { bobbieReadingEm } from './LibraryArtwork';
import { LibraryBookDetails } from './NeighborhoodLibrary';
import { normalizeLibrary, LIBRARY_BOOKS } from './neighborhood-library.mjs';
import InteractiveRoom from './InteractiveRoom';
import { RoomVisitors } from './NeighborhoodWorld';

const spaRoom = require('../assets/characters/em-interactive-spa.jpg');

const pastArtwork = [
  require('../assets/characters/spa-welcome.png'),
  require('../assets/characters/spa-westley-secret.png'),
  require('../assets/characters/spa-chapo-cookie-cleanup.png'),
  require('../assets/characters/spa-bobbie-jacuzzi.png'),
  require('../assets/characters/spa-glamour-and-tate.png'),
];
const currentVisitArtwork=[require('../assets/characters/spa-slumber-party.jpg'),require('../assets/characters/spa-slumber-grooming.jpg'),require('../assets/characters/spa-slumber-fort.jpg'),require('../assets/characters/spa-slumber-ocean.jpg')];

function SpaAtmosphere({ playing, kind }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    progress.setValue(0);
    if (!playing) return undefined;
    const loop = Animated.loop(Animated.timing(progress, { toValue: 1, duration: kind === 'dryer' ? 2600 : 5500, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [playing, kind, progress]);
  if (!playing) return null;
  return <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFillObject}>
    {[0, 1, 2, 3, 4].map(i => <Animated.View key={i} style={[s.bubble, {
      left: `${16 + i * 17}%`, bottom: `${8 + (i % 3) * 12}%`,
      width: kind === 'dryer' ? 38 : 10 + i * 4, height: kind === 'dryer' ? 3 : 10 + i * 4,
      opacity: progress.interpolate({ inputRange: [0, 0.2, 0.75, 1], outputRange: [0, 0.6, 0.4, 0] }),
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -35 - i * 5] }) },
        { translateX: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, kind === 'dryer' ? 22 : 7, 0] }) }],
    }]} />)}
  </View>;
}

export default function PetSpa({ onGrooming, obscured = false, reduceAnimation = false, library, onLibraryChange }) {
  const bobbieHasBook = normalizeLibrary(library).loans[LIBRARY_BOOKS[0].id]?.reader === 'bobbie';
  const [visitId,setVisitId]=useState('slumber-party');
  const [panel, setPanel] = useState('room');
  const visit=SPA_VISITS.find(item=>item.id===visitId)||SPA_VISITS[0];
  const scenes=visit.scenes;
  const artwork=visit.current?currentVisitArtwork:pastArtwork;
  const [index, setIndex] = useState(0);
  const openVisit=id=>{setVisitId(id);setIndex(0);setPanel('visit');setPaused(true);setReply('');};
  const [bookDetails, setBookDetails] = useState(false);
  const [paused, setPaused] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [focused, setFocused] = useState(true);
  const [reply, setReply] = useState('');
  const motionOff = reducedMotion || reduceAnimation;
  const playing = spaCanPlay({ paused, reducedMotion: motionOff, active, focused: focused && !obscured && !bookDetails && panel === 'visit' });
  const currentArtwork = artwork.map((source,i) => !visit.current && i === 3 && bobbieHasBook ? bobbieReadingEm : source);
  const scene = !visit.current && index === 3 && bobbieHasBook ? {...scenes[index], caption:'Bobbie has borrowed Before You Call Me Difficult by Emma Acly from Annie’s library. A little self-care and a good book, darling.'} : scenes[index];
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReducedMotion(value); }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    const app = AppState.addEventListener('change', state => setActive(state === 'active'));
    const blur = Platform.OS === 'android' ? AppState.addEventListener('blur', () => setFocused(false)) : null;
    const focus = Platform.OS === 'android' ? AppState.addEventListener('focus', () => setFocused(true)) : null;
    return () => { mounted = false; motion.remove(); app?.remove(); blur?.remove(); focus?.remove(); };
  }, []);
  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => { setIndex(current => nextSpaScene(current,1,scenes)); setReply(''); }, 12000);
    return () => clearInterval(timer);
  }, [playing, index, visitId]);
  const choose = next => { setIndex(next); setReply(''); setPaused(true); };
  const showRoom = () => { setPaused(true); setPanel('room'); };
  const bookOverlay = bookDetails && <LibraryBookDetails bookId={LIBRARY_BOOKS[0].id} value={library} onChange={onLibraryChange} onClose={() => setBookDetails(false)} backLabel="Back to Em’s Pet Spa" />;
  const roomBack = <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to the spa room" style={s.back} onPress={showRoom}><Text style={s.backText}>‹ Spa room</Text></TouchableOpacity>;
  if (panel === 'room') return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <Text accessibilityRole="header" style={s.title}>Em’s Pet Spa</Text>
    <InteractiveRoom source={spaRoom} testID="spa-room-artwork" destinations={[
      ...(onGrooming ? [{label:'Open grooming appointments',caption:'Grooming',area:{left:'8%',top:'14%',width:'30%',height:'31%'},open:onGrooming}] : []),
      {label:'Open current spa stay',caption:'Current Stay',area:{left:'61%',top:'14%',width:'30%',height:'30%'},open:()=>openVisit('slumber-party')},
      {label:'Open Em’s scrapbook',caption:'Scrapbook',area:{left:'8%',top:'62%',width:'30%',height:'29%'},open:()=>setPanel('scrapbook')},
      ...(bobbieHasBook ? [{label:'Open the library book Bobbie borrowed',caption:'Borrowed Book',area:{left:'61%',top:'62%',width:'30%',height:'29%'},open:()=>setBookDetails(true)}] : []),
    ]}><EncouragementSpot place="spa" style={{ left: '48%', top: '91%' }} /></InteractiveRoom>
    <Text style={s.body}>Tap the grooming station, lounge, or scrapbook.</Text>
    <RoomVisitors destination="Spa" />
    {bookOverlay}
  </ScrollView>;
  const illustration = <View style={s.artCard}><ContainedIllustration source={currentArtwork[index]} aspectRatio={scene.ratio} style={{ borderRadius: 18 }} accessibilityLabel={scene.caption}>
    <SpaAtmosphere playing={playing} kind={scene.motion} />
    <EncouragementSpot place="spa"/>
  </ContainedIllustration><View style={s.brandBanner}><PayPlaceBrand compact/><Text style={s.spaBrand}>Em’s Pet Spa</Text></View></View>;
  if(panel === 'scrapbook') return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    {roomBack}
    <Text accessibilityRole="header" style={s.title}>Em’s scrapbook</Text><Text style={s.body}>Favorite visits stay here, ready to open again.</Text>
    {SPA_VISITS.map(item=><TouchableOpacity key={item.id} artworkMode="integrated" accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={()=>openVisit(item.id)} style={[s.card,{flexDirection:'row',alignItems:'center'}]}>
      <Image source={item.current?currentVisitArtwork[0]:pastArtwork[0]} style={{width:96,height:96}} resizeMode="contain" accessible={false}/><View style={{flex:1}}><Text style={s.sceneTitle}>{item.title}</Text><Text style={s.hint}>{item.current?'CURRENT STAY':'PAST VISIT'}</Text><Text style={s.body}>{item.description}</Text></View>
    </TouchableOpacity>)}
    <TouchableOpacity accessibilityRole="button" style={s.action} onPress={()=>openVisit('slumber-party')}><Text style={s.actionText}>Back to the current stay</Text></TouchableOpacity>
  </ScrollView>;
  return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    {roomBack}
    <View style={s.card}>
      <Text style={s.hint}>{visit.current?"CURRENT STAY":"FROM EM’S SCRAPBOOK"} · {visit.title}</Text>
      {!visit.current && index === 3 && bobbieHasBook ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open Emma’s book Bobbie is reading at the spa" onPress={() => setBookDetails(true)}>{illustration}</TouchableOpacity> : illustration}
      <Text style={s.sceneTitle} accessibilityRole="header">{scene.title}</Text>
      <Text style={s.body}>{scene.caption}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => { setPaused(true); setReply(scene.reply); }} style={s.action}><Text style={s.actionText}>{scene.action}</Text></TouchableOpacity>
      {!!reply && <Text accessibilityLiveRegion="polite" style={s.reply}>{reply}</Text>}
      <View style={s.controls}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous spa scene" onPress={() => choose(nextSpaScene(index,-1,scenes))} style={s.control}><Text style={s.controlText}>‹ Previous</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={paused ? 'Resume spa scenes' : 'Pause spa scenes'} accessibilityState={{ disabled: motionOff }} disabled={motionOff} onPress={() => setPaused(value => !value)} style={[s.control, motionOff && { opacity: 0.6 }]}><Text style={s.controlText}>{motionOff ? 'Motion off' : paused ? 'Play' : 'Pause'}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Next spa scene" onPress={() => choose(nextSpaScene(index,1,scenes))} style={s.control}><Text style={s.controlText}>Next ›</Text></TouchableOpacity>
      </View>
      <Text style={s.hint}>{index + 1} of {scenes.length}{motionOff ? ' · Use Previous or Next to browse.' : ''}</Text>
    </View>
    {!visit.current&&<TouchableOpacity accessibilityRole="button" style={s.back} onPress={()=>openVisit('slumber-party')}><Text style={s.backText}>Back to the current stay</Text></TouchableOpacity>}
    {bookOverlay}
  </ScrollView>;
}

const s = StyleSheet.create({
  artCard: {borderRadius:18,overflow:'hidden',backgroundColor:'#FFFDF8'},
  brandBanner: {flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:10,padding:12,backgroundColor:'#E0FFF5',borderTopWidth:1,borderColor:'#B1E9D9'},
  spaBrand: {fontSize:16,fontWeight:'800',color:'#184F48'},
  screen: { flex: 1, backgroundColor: '#FFF8F2' }, content: { padding: 18, gap: 12, paddingBottom: 26 },
  back: { minHeight: 48, justifyContent: 'center' }, backText: { color: '#6651AB', fontWeight: '800', fontSize: 15 },
  title: { color: '#173557', fontSize: 30, fontWeight: '900' },
  body: { color: '#34465E', fontSize: 15, lineHeight: 23 }, card: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 24, gap: 12, borderWidth: 1, borderColor: '#F7CDE0' },
  sceneTitle: { color: '#173557', fontSize: 21, fontWeight: '900' }, action: { backgroundColor: '#A52167', padding: 15, minHeight: 48, borderRadius: 15 }, actionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  reply: { backgroundColor: '#FFF0F6', color: '#812653', padding: 14, borderRadius: 14, fontSize: 16, lineHeight: 24 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, control: { flexGrow: 1, backgroundColor: '#F0EAFE', borderRadius: 13, padding: 12, minHeight: 48, justifyContent: 'center' }, controlText: { color: '#51398D', fontWeight: '800', textAlign: 'center' },
  hint: { color: '#556277', fontSize: 12, lineHeight: 18 },
  bubble: { position: 'absolute', borderRadius: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)', backgroundColor: 'rgba(180,233,255,0.16)' },
});
