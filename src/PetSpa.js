import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import PayPlaceBrand from './PayPlaceBrand';
import { EncouragementSpot } from './Encouragement';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SPA_SCENES, SPA_VISITS, nextSpaScene, spaCanPlay } from './spa-scenes.mjs';
import ContainedIllustration from './ContainedIllustration';
import { bobbieReadingEm } from './LibraryArtwork';
import { LibraryBookDetails } from './NeighborhoodLibrary';
import { normalizeLibrary, LIBRARY_BOOKS } from './neighborhood-library.mjs';

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

export default function PetSpa({ onHome, obscured = false, reduceAnimation = false, library, onLibraryChange }) {
  const bobbieHasBook = normalizeLibrary(library).loans[LIBRARY_BOOKS[0].id]?.reader === 'bobbie';
  const [visitId,setVisitId]=useState('slumber-party');
  const [scrapbook,setScrapbook]=useState(false);
  const visit=SPA_VISITS.find(item=>item.id===visitId)||SPA_VISITS[0];
  const scenes=visit.scenes;
  const artwork=visit.current?currentVisitArtwork:pastArtwork;
  const [index, setIndex] = useState(0);
  const openVisit=id=>{setVisitId(id);setIndex(0);setScrapbook(false);setPaused(true);setReply('');};
  const [bookDetails, setBookDetails] = useState(false);
  const [paused, setPaused] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [focused, setFocused] = useState(true);
  const [reply, setReply] = useState('');
  const motionOff = reducedMotion || reduceAnimation;
  const playing = spaCanPlay({ paused, reducedMotion: motionOff, active, focused: focused && !obscured && !bookDetails && !scrapbook });
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
  const illustration = <ContainedIllustration source={currentArtwork[index]} aspectRatio={scene.ratio} style={{ borderRadius: 18 }} accessibilityLabel={scene.caption}>
    <SpaAtmosphere playing={playing} kind={scene.motion} />
    <View pointerEvents="none" accessible={false} style={{position:"absolute",top:8,left:8,backgroundColor:"rgba(255,253,248,.94)",padding:6,borderRadius:10}}><PayPlaceBrand compact/><Text style={{fontSize:10,color:"#A52167",fontWeight:"800"}}>Em’s Pet Spa</Text></View>
    <EncouragementSpot place="spa"/>
  </ContainedIllustration>;
  if(scrapbook) return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <TouchableOpacity artworkAction="browse" accessibilityRole="button" style={s.back} onPress={()=>setScrapbook(false)}><Text style={s.backText}>‹ Back to Em’s Pet Spa</Text></TouchableOpacity>
    <Text accessibilityRole="header" style={s.title}>Em’s scrapbook</Text><Text style={s.body}>Favorite visits stay here, ready to open again.</Text>
    {SPA_VISITS.map(item=><TouchableOpacity key={item.id} artworkMode="integrated" accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={()=>openVisit(item.id)} style={[s.card,{flexDirection:'row',alignItems:'center'}]}>
      <Image source={item.current?currentVisitArtwork[0]:pastArtwork[0]} style={{width:96,height:96}} resizeMode="contain" accessible={false}/><View style={{flex:1}}><Text style={s.sceneTitle}>{item.title}</Text><Text style={s.hint}>{item.current?'CURRENT STAY':'PAST VISIT'}</Text><Text style={s.body}>{item.description}</Text></View>
    </TouchableOpacity>)}
    <TouchableOpacity artworkAction="browse" accessibilityRole="button" style={s.action} onPress={()=>openVisit('slumber-party')}><Text style={s.actionText}>Back to the current stay</Text></TouchableOpacity>
  </ScrollView>;
  return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <TouchableOpacity accessibilityRole="button" onPress={onHome} style={s.back}><Text style={s.backText}>‹ Back to the neighborhood</Text></TouchableOpacity>
    <Text style={s.eyebrow}>A LITTLE CARE GOES A LONG WAY</Text>
    <Text accessibilityRole="header" style={s.title}>Em’s Pet Spa</Text>
    <Text style={s.body}>Grooming, pampering, cozy stays, and a few little adventures. Em has it covered.</Text>
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
      <Text style={s.hint}>{index + 1} of {scenes.length} · {motionOff ? 'Choose a scene below. Quiet Mode or reduced motion is on.' : paused ? 'Take your time. Tap Play only if you want scenes to rotate.' : 'A new little moment every 12 seconds.'}</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scenePicker}>
      {scenes.map((item, i) => <TouchableOpacity artworkMode="integrated" key={item.id} accessibilityRole="button" accessibilityLabel={`Show ${item.title}`} accessibilityState={{ selected: i === index }} onPress={() => choose(i)} style={[s.thumbnail, i === index && s.selected]}>
        <Image source={currentArtwork[i]} resizeMode="contain" style={s.thumbImage} accessible={false} />
        <Text style={s.thumbText}>{item.title}</Text>
      </TouchableOpacity>)}
    </ScrollView>
    <TouchableOpacity artworkAction="scrapbook" accessibilityRole="button" accessibilityLabel="Open Em’s scrapbook" style={s.action} onPress={()=>{setPaused(true);setScrapbook(true);}}><Text style={s.actionText}>Open Em’s scrapbook</Text></TouchableOpacity>
    {!visit.current&&<TouchableOpacity artworkAction="browse" accessibilityRole="button" style={s.back} onPress={()=>openVisit('slumber-party')}><Text style={s.backText}>Back to the current stay</Text></TouchableOpacity>}
    {bobbieHasBook&&<TouchableOpacity artworkAction="browse" accessibilityRole="button" accessibilityLabel="Open the library book Bobbie borrowed" style={s.back} onPress={()=>setBookDetails(true)}><Text style={s.backText}>Open the library book Bobbie borrowed</Text></TouchableOpacity>}
    <Text style={s.footer}>You don’t have to accomplish anything here. Sometimes a little neighborhood joy is enough.</Text>
    {bookDetails && <LibraryBookDetails bookId={LIBRARY_BOOKS[0].id} value={library} onChange={onLibraryChange} onClose={() => setBookDetails(false)} backLabel="Back to Em’s Pet Spa" />}
  </ScrollView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF8F2' }, content: { padding: 18, gap: 12, paddingBottom: 26 },
  back: { minHeight: 48, justifyContent: 'center' }, backText: { color: '#6651AB', fontWeight: '800', fontSize: 15 },
  eyebrow: { color: '#A52167', fontWeight: '900', fontSize: 11, letterSpacing: 1.2 }, title: { color: '#173557', fontSize: 30, fontWeight: '900' },
  body: { color: '#34465E', fontSize: 15, lineHeight: 23 }, card: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 24, gap: 12, borderWidth: 1, borderColor: '#F7CDE0' },
  sceneTitle: { color: '#173557', fontSize: 21, fontWeight: '900' }, action: { backgroundColor: '#A52167', padding: 15, minHeight: 48, borderRadius: 15 }, actionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  reply: { backgroundColor: '#FFF0F6', color: '#812653', padding: 14, borderRadius: 14, fontSize: 16, lineHeight: 24 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, control: { flexGrow: 1, backgroundColor: '#F0EAFE', borderRadius: 13, padding: 12, minHeight: 48, justifyContent: 'center' }, controlText: { color: '#51398D', fontWeight: '800', textAlign: 'center' },
  hint: { color: '#556277', fontSize: 12, lineHeight: 18 }, scenePicker: { gap: 10, paddingVertical: 4 }, thumbnail: { width: 108, padding: 6, borderWidth: 2, borderColor: '#E5DCE6', borderRadius: 16, backgroundColor: '#FFFFFF' }, selected: { borderColor: '#A52167', backgroundColor: '#FFF0F6' }, thumbImage: { width: '100%', height: 85, borderRadius: 10 }, thumbText: { fontSize: 13, color: '#34465E', fontWeight: '800', textAlign: 'center', padding: 5 },
  footer: { color: '#6651AB', fontSize: 14, lineHeight: 22, textAlign: 'center' }, bubble: { position: 'absolute', borderRadius: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)', backgroundColor: 'rgba(180,233,255,0.16)' },
});
