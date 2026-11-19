import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { payplaceLogo, payplaceLogoLabel, payplaceColors } from './brand';
import FittedArtwork from './FittedArtwork';
import { sharePerViewVideo } from './per-view-sharing';
import { PER_VIEW_MEDIA } from './PerViewMedia';
import { PER_VIEW_VIDEOS, normalizePerView, perViewResumeAt, perViewRows, perViewTime, recordPerViewProgress, recordPerViewWatch, togglePerViewFavorite } from './payplace-per-view.mjs';

function Favorite({ video, saved, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${saved ? 'Remove' : 'Save'} ${video.title} ${saved ? 'from' : 'to'} My Favorites`}
    accessibilityState={{ selected: saved }} onPress={onPress} style={({ pressed }) => [s.favorite, saved && s.favoriteSaved, pressed && s.pressed]}>
    <Text style={s.favoriteText}>{saved ? '✓ My List' : '+ My List'}</Text>
  </Pressable>;
}

export function DaddyTelevision({ onPress }) {
  return <View style={s.televisionArea}>
    <Pressable testID="daddy-per-view-tv" accessibilityRole="button" accessibilityLabel="Open PayPlacePerView on Daddy’s TV" onPress={onPress}
      style={({ pressed }) => [s.television, pressed && s.pressed]}>
      <View style={s.televisionScreen}>
        <FittedArtwork source={PER_VIEW_MEDIA['daddy-episode-1'].poster} aspectRatio={512 / 910} style={s.televisionPoster} resizeMode="contain" accessible={false} />
        <View style={s.televisionCopy}><Text style={s.eyebrow}>DADDY’S TV</Text><Text style={s.televisionTitle}>PayPlace<Text style={s.coral}>PerView</Text></Text>
          <Text style={s.televisionNote}>Your favorite neighborhood videos, all together.</Text><Text style={s.televisionPlay}>Turn it on</Text></View>
      </View>
    </Pressable>
    <View accessible={false} style={s.televisionStand} /><View accessible={false} style={s.televisionFoot} />
  </View>;
}

function Playback({ video, startAt, onProgress, onWatch, onRetry }) {
  const [status, setStatus] = useState('loading');
  const callback = useRef(onProgress); callback.current = onProgress;
  const watchCallback = useRef(onWatch); watchCallback.current = onWatch;
  const position = useRef({ seconds: startAt, duration: video.duration });
  const savedBucket = useRef(-1);
  const player = useVideoPlayer(PER_VIEW_MEDIA[video.id].source, instance => {
    instance.loop = false;
    instance.staysActiveInBackground = false;
    instance.timeUpdateEventInterval = 2;
  });
  useEffect(() => {
    let active = true;
    const flush = () => callback.current(video.id, position.current.seconds, position.current.duration);
    let started = false;
    let counted = false;
    const startWhenReady = () => {
      if (!active || started) return;
      started = true;
      if (startAt > 0) player.currentTime = startAt;
      if (AppState.currentState === 'active') player.play();
    };
    const subscriptions = [
      player.addListener('statusChange', event => {
        if (active) setStatus(event.status);
        if (event.status === 'readyToPlay') startWhenReady();
      }),
      player.addListener('timeUpdate', event => {
        if (!Number.isFinite(event.currentTime)) return;
        if (started && !counted && event.currentTime > startAt + 1) { counted = true; watchCallback.current(video.id); }
        position.current = { seconds: event.currentTime, duration: player.duration > 0 ? player.duration : video.duration };
        const bucket = Math.floor(event.currentTime / 10);
        if (bucket !== savedBucket.current && event.currentTime > 1) { savedBucket.current = bucket; flush(); }
      }),
      player.addListener('playingChange', event => { if (!event.isPlaying) flush(); }),
      player.addListener('playToEnd', () => {
        position.current = { seconds: player.duration > 0 ? player.duration : video.duration, duration: player.duration > 0 ? player.duration : video.duration };
        flush();
      }),
    ];
    const app = AppState.addEventListener('change', next => { if (next !== 'active') { player.pause(); flush(); } });
    if (player.status === 'readyToPlay') { setStatus('readyToPlay'); startWhenReady(); }
    if (player.status === 'error') setStatus('error');
    return () => {
      active = false;
      subscriptions.forEach(subscription => subscription.remove()); app.remove();
      try { player.pause(); } catch { /* The native hook may already have released its player. */ }
      flush();
    };
  }, [player, video.id]);
  return <>
    <View style={s.playerFrame}><VideoView testID="per-view-video" player={player} style={s.playerVideo} contentFit="contain" nativeControls
      playsInline fullscreenOptions={{ enable: true }} allowsPictureInPicture={false} startsPictureInPictureAutomatically={false}
      accessibilityLabel={`${video.title}, video with playback controls`} /></View>
    {status === 'loading' && <View style={s.playerStatus} accessibilityLiveRegion="polite"><ActivityIndicator color="#FFE344" /><Text style={s.playerNote}>Getting your video ready…</Text></View>}
    {status === 'error' && <View style={s.playerStatus} accessibilityLiveRegion="polite"><Text style={s.playerNote}>That video couldn’t open. You can try it again.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Retry PayPlacePerView video" onPress={onRetry} style={s.watch}><Text style={s.watchText}>Try again</Text></Pressable></View>}
  </>;
}

export default function PayPlacePerView({ value, onChange, onClose, onQuiltMilestone, tvSquareEarned = false, isSample = false }) {
  const state = normalizePerView(value);
  const [sharePrompt, setSharePrompt] = useState(null);
  const shareBusy = useRef(false);
  const [shareStatus, setShareStatus] = useState('');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [watching, setWatching] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const { width } = useWindowDimensions();
  const rows = perViewRows(state, query, filter);
  const accents = { all: payplaceColors.turquoise, series: payplaceColors.yellow, commercials: payplaceColors.purple, favorites: payplaceColors.coral };
  const rowAccents = { continue: payplaceColors.turquoise, recommended: payplaceColors.yellow, 'most-viewed': payplaceColors.coral, favorites: payplaceColors.purple, commercials: payplaceColors.purple, results: payplaceColors.turquoise };
  const featured = PER_VIEW_VIDEOS[0];
  const posterWidth = Math.min(170, Math.max(132, width * 0.36));
  const favorite = video => onChange(current => togglePerViewFavorite(current, video.id));
  const progress = (id, seconds, duration) => onChange(current => recordPerViewProgress(current, id, seconds, duration));
  const watch = video => { setAttempt(0); setWatching({ video, startAt: perViewResumeAt(state, video.id) }); };
  const share = async video => {
    if (shareBusy.current) return;
    shareBusy.current = true;
    setShareStatus('Preparing your video…');
    try {
      const result = await sharePerViewVideo(PER_VIEW_MEDIA[video.id].source, video.id);
      setShareStatus('');
      setSharePrompt({ video, launched: true, downloaded: result.status === 'downloaded' });
    } catch { setShareStatus('That video could not be shared just now. Please try again.'); }
    finally { shareBusy.current = false; }
  };
  const shareButton = video => <Pressable accessibilityRole="button" accessibilityLabel={`Share ${video.title} on social media`} onPress={() => setSharePrompt({ video, launched: false })} style={s.shareButton}><Text style={s.shareText}>Share video</Text></Pressable>;
  const recordWatch = id => onChange(current => recordPerViewWatch(current, id));
  const hasResults = rows.some(row => row.videos.length);
  return <View testID="payplace-per-view" style={s.screen}>
    <View style={s.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close PayPlacePerView and return to Daddy’s house" onPress={onClose} style={s.back}><Text style={s.backText}>‹ Daddy’s house</Text></Pressable>
      <View style={s.wordmark}><Image source={payplaceLogo} style={s.logo} accessibilityLabel={payplaceLogoLabel} /><Text accessibilityRole="header" style={s.brand}>PayPlace<Text style={s.coral}>PerView</Text></Text></View>
    </View>
    {!!shareStatus && <Text accessibilityLiveRegion="polite" style={s.playerNote}>{shareStatus}</Text>}
    <ScrollView key="per-view-library" style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.tagline}>Your neighborhood. On screen.</Text>
      <TextInput accessibilityLabel="Search PayPlacePerView videos" value={query} onChangeText={setQuery} placeholder="Search your neighborhood videos" placeholderTextColor="#B7BED2"
        autoCorrect={false} returnKeyType="search" style={s.search} />
      <View style={s.filters}>{[['all', 'Home', 'All'], ['series', 'TV Shows', 'TV Shows'], ['commercials', 'Commercials', 'Commercials'], ['favorites', 'My List', 'My Favorites']].map(([id, label, accessibleLabel]) =>
        <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Show ${accessibleLabel} in PayPlacePerView`} accessibilityState={{ selected: filter === id }}
          onPress={() => setFilter(id)} style={[s.chip, { backgroundColor: accents[id], borderColor: accents[id] }, filter === id && s.selectedChip]}><Text style={[s.chipText, id === 'commercials' && s.purpleChipText]}>{label}</Text></Pressable>)}</View>
      {filter === 'all' && !query.trim() && <View style={s.hero}>
        <FittedArtwork source={require('../assets/characters/daddy-neighborhood-feedback.png')} aspectRatio={3 / 2} accessible={false} resizeMode="contain" style={s.heroPoster} />
        <View style={s.heroCopy}><Text style={s.eyebrow}>PAYPLACE ORIGINAL · FEATURED SHOW</Text><Text accessibilityRole="header" style={s.heroTitle}>Meet Daddy.</Text>
          <Text style={s.description}>A familiar face. A little laughter. A place to belong.</Text><Text style={s.duration}>{featured.title} · {perViewTime(featured.duration)}</Text>
          <View style={s.heroActions}><Pressable accessibilityRole="button" accessibilityLabel={`Watch ${featured.title}`} onPress={() => watch(featured)} style={[s.watch, s.heroAction]}><Text style={s.watchText}>{perViewResumeAt(state, featured.id) > 0 ? '▶ Resume' : '▶ Play'}</Text></Pressable>
          <View style={s.heroAction}><Favorite video={featured} saved={state.favorites.includes(featured.id)} onPress={() => favorite(featured)} /></View></View>
          {shareButton(featured)}
        </View>
      </View>}
      {rows.filter(row => row.videos.length || row.empty).map(row => <View key={row.id} style={s.row}>
        <Text accessibilityRole="header" style={[s.rowTitle, s.rowHeading, { borderLeftColor: rowAccents[row.id] }]}>{row.id === 'favorites' ? 'My List' : row.title}</Text>
        {row.subtitle && <Text style={s.rowSubtitle}>{row.subtitle}</Text>}
        {!row.videos.length && <Text style={s.emptyRow}>{row.empty}</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={s.rail} accessibilityLabel={row.title}>
          {row.videos.map(video => <View key={video.id} style={[s.videoCard, { width: posterWidth }]}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Play ${video.title} from ${row.title}`} onPress={() => watch(video)} style={({ pressed }) => [s.posterButton, { borderColor: rowAccents[row.id] }, pressed && s.pressed]}>
              <FittedArtwork source={PER_VIEW_MEDIA[video.id].poster} aspectRatio={video.ratio} accessible={false} resizeMode="contain" />
              <Text style={s.cardTitle}>{video.title}</Text><Text style={s.cardMeta}>{video.collection} · {perViewTime(video.duration)}</Text>
              {row.id === 'most-viewed' && <Text style={s.viewCount}>{state.views[video.id]} {state.views[video.id] === 1 ? 'watch' : 'watches'} by you</Text>}
              {row.id === 'continue' && <View style={s.progressTrack}><View style={[s.progressFill, { width: `${Math.min(100, state.progress[video.id].seconds / state.progress[video.id].duration * 100)}%` }]} /></View>}
            </Pressable>
            <Favorite video={video} saved={state.favorites.includes(video.id)} onPress={() => favorite(video)} />
            {shareButton(video)}
          </View>)}
        </ScrollView>
      </View>)}
      {!hasResults && <View style={s.empty} accessibilityLiveRegion="polite"><Text style={s.rowTitle}>{filter === 'favorites' && !query.trim() ? 'Your favorites live here.' : 'No matching videos yet.'}</Text>
        <Text style={s.description}>{filter === 'favorites' && !query.trim() ? 'Tap Save on a video, and it will be waiting here next time.' : 'Try another title or character name.'}</Text></View>}
    </ScrollView>
    <Modal visible={!!watching} animationType="slide" onRequestClose={() => setWatching(null)}>
      {watching && <SafeAreaView style={s.playerSafe}>
        <View style={s.playerHeader}><Pressable accessibilityRole="button" accessibilityLabel="Close video and return to PayPlacePerView" onPress={() => setWatching(null)} style={s.back}><Text style={s.backText}>‹ PayPlacePerView</Text></Pressable>
          <Text accessibilityRole="header" style={s.playerTitle}>{watching.video.title}</Text>
          <Favorite video={watching.video} saved={state.favorites.includes(watching.video.id)} onPress={() => favorite(watching.video)} /></View>
        <Playback key={`${watching.video.id}-${attempt}`} video={watching.video} startAt={watching.startAt} onProgress={progress} onWatch={recordWatch} onRetry={() => setAttempt(current => current + 1)} />
        <Text style={s.playerNote}>Use the player controls to pause, replay, or watch full screen.</Text>
      </SafeAreaView>}
    </Modal>
    <Modal visible={!!sharePrompt} transparent animationType="fade" onRequestClose={() => setSharePrompt(null)}>
      {sharePrompt && <SafeAreaView style={s.shareOverlay}><ScrollView contentContainerStyle={s.shareSheet}>
        <Text accessibilityRole="header" style={s.rowTitle}>Share a little PayPlace.</Text>
        <Text style={s.description}>{sharePrompt.downloaded ? 'Save the video, then upload it to Facebook or your favorite social app.' : 'Share this video to Facebook or your favorite social app. Your phone lets you choose where to send it.'}</Text>
        <Text style={s.description}>To tag us on Facebook, type @PayPlace in your post and select the official PayPlace Page. Facebook needs you to choose the tag.</Text>
        <Text style={s.description}>You can also add #PayPlace and #PayPlacePerView.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Open sharing options for ${sharePrompt.video.title}`} style={s.watch} onPress={() => share(sharePrompt.video)}><Text style={s.watchText}>Share or save video</Text></Pressable>
        {!!shareStatus && <Text accessibilityLiveRegion="polite" style={s.description}>{shareStatus}</Text>}
        {!tvSquareEarned && <><Image source={require('../assets/characters/quilt-shared-per-view.png')} style={s.tvPatch} resizeMode="contain" accessibilityLabel="Purple embroidered TV quilt square" />
          <Text style={s.description}>{isSample ? 'Share a video from your own plan to add this TV square to your quilt.' : 'After you post your first video, add this TV square to your Belonging Quilt.'}</Text></>}
        {!tvSquareEarned && !isSample && onQuiltMilestone && sharePrompt.launched && <Pressable accessibilityRole="button" accessibilityLabel="I posted a PayPlacePerView video; add my TV quilt square" style={s.watch} onPress={() => { onQuiltMilestone('sharedPerView'); setSharePrompt(null); setShareStatus('Your TV square is waiting on your Belonging Quilt in Annie’s home.'); }}><Text style={s.watchText}>I posted it · Add my TV square</Text></Pressable>}
        <Pressable accessibilityRole="button" accessibilityLabel="Close sharing instructions" style={s.favorite} onPress={() => setSharePrompt(null)}><Text style={s.favoriteText}>{tvSquareEarned ? 'Done' : 'Maybe later'}</Text></Pressable>
      </ScrollView></SafeAreaView>}
    </Modal>
  </View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#111831' }, scroll: { flex: 1 }, content: { padding: 16, paddingBottom: 32, gap: 18 },
  header: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10, gap: 5, borderBottomWidth: 1, borderColor: '#334061' },
  back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: 2 }, backText: { color: payplaceColors.turquoise, fontSize: 16, fontWeight: '700' },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 8 }, logo: { width: 34, height: 34 }, brand: { flexShrink: 1, color: payplaceColors.turquoise, fontSize: 25, fontWeight: '900' }, coral: { color: payplaceColors.coral },
  tagline: { color: '#F4E9FF', fontSize: 16, fontWeight: '600' }, search: { minHeight: 48, borderWidth: 1, borderColor: payplaceColors.purple, borderRadius: 14, color: '#FFFFFF', backgroundColor: '#202942', fontSize: 16, paddingHorizontal: 13, paddingVertical: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 44, justifyContent: 'center', borderRadius: 22, borderWidth: 2, borderColor: payplaceColors.turquoise, paddingHorizontal: 11, paddingVertical: 9 }, selectedChip: { borderColor: '#FFFFFF' }, chipText: { color: payplaceColors.ink, fontSize: 14, fontWeight: '700' }, purpleChipText: { color: '#FFFFFF' },
  hero: { borderRadius: 22, backgroundColor: '#202D40', overflow: 'hidden', borderWidth: 2, borderColor: payplaceColors.turquoise },
  heroPoster: { width: '100%' }, heroCopy: { padding: 18, gap: 10 }, heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 }, heroAction: { flexGrow: 1, flexBasis: 130 },
  eyebrow: { color: payplaceColors.yellow, fontSize: 11, lineHeight: 16, fontWeight: '900', letterSpacing: 1.1 }, heroTitle: { color: '#FFFFFF', fontSize: 34, fontWeight: '900' }, description: { color: '#E0E4F1', fontSize: 16, lineHeight: 23 }, duration: { color: '#C4CDE1', fontSize: 13 },
  watch: { minHeight: 46, backgroundColor: '#FFE344', borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10 }, watchText: { color: '#14223A', fontSize: 17, fontWeight: '900' },
  favorite: { minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: payplaceColors.purple, backgroundColor: payplaceColors.purple }, favoriteSaved: { backgroundColor: '#3C224F', borderColor: payplaceColors.coral }, favoriteText: { color: '#FFF0F3', fontSize: 14, fontWeight: '800' }, pressed: { opacity: 0.78 },
  shareButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: payplaceColors.turquoise, backgroundColor: payplaceColors.turquoise }, shareText: { color: payplaceColors.ink, fontSize: 14, fontWeight: '700' }, shareOverlay: { flex: 1, justifyContent: 'center', backgroundColor: '#080C19F2', padding: 20 }, shareSheet: { padding: 18, gap: 18, backgroundColor: '#202A43', borderRadius: 22 }, tvPatch: { width: 120, height: 120, alignSelf: 'center' },
  rowSubtitle: { color: '#BFCADC', fontSize: 14, lineHeight: 20 }, emptyRow: { color: '#BAC6DB', fontSize: 15, lineHeight: 22, paddingVertical: 16, paddingHorizontal: 15, borderRadius: 13, backgroundColor: '#202A40' }, viewCount: { color: payplaceColors.yellow, fontSize: 12, paddingHorizontal: 10, paddingTop: 4 },
  rowHeading: { borderLeftWidth: 4, paddingLeft: 10 }, row: { gap: 10 }, rowTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '900' }, rail: { gap: 12, paddingBottom: 10, alignItems: 'flex-start' }, videoCard: { gap: 8, flexShrink: 0 }, posterButton: { borderRadius: 17, borderWidth: 1, borderColor: '#776195', backgroundColor: '#202A43', overflow: 'hidden', paddingBottom: 10 }, cardTitle: { color: '#FFFFFF', fontSize: 16, lineHeight: 21, fontWeight: '800', paddingHorizontal: 10, paddingTop: 10 }, cardMeta: { color: '#CAD3E5', fontSize: 12, lineHeight: 18, paddingHorizontal: 10, paddingTop: 4 }, progressTrack: { height: 4, backgroundColor: '#58617C', marginHorizontal: 10, marginTop: 8, borderRadius: 2, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: payplaceColors.turquoise }, empty: { padding: 18, gap: 10, borderRadius: 18, backgroundColor: '#252C46' },
  playerSafe: { flex: 1, backgroundColor: '#080C19' }, playerHeader: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 }, playerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' }, playerFrame: { flex: 1, minHeight: 100, backgroundColor: '#000000' }, playerVideo: { width: '100%', height: '100%' }, playerStatus: { padding: 12, alignItems: 'center', gap: 10 }, playerNote: { color: '#D9DCEC', fontSize: 13, lineHeight: 19, padding: 12, textAlign: 'center' },
  televisionArea: { marginVertical: 8, alignItems: 'center' }, television: { width: '100%', borderRadius: 21, backgroundColor: '#27334C', borderWidth: 3, borderColor: payplaceColors.purple, padding: 8, shadowColor: '#071A3A', shadowOffset: { width: 0, height: 4 }, shadowRadius: 7, shadowOpacity: 0.2, elevation: 3 }, televisionScreen: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#111831' }, televisionPoster: { width: '28%', aspectRatio: 512 / 910, borderRadius: 7 }, televisionCopy: { flex: 1, minWidth: 0, gap: 8 }, televisionTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '900' }, televisionNote: { color: '#D6DEEC', fontSize: 14, lineHeight: 20 }, televisionPlay: { color: '#FFE344', fontSize: 17, fontWeight: '900', paddingTop: 3 }, televisionStand: { width: 30, height: 13, backgroundColor: payplaceColors.purple }, televisionFoot: { width: 104, height: 7, backgroundColor: payplaceColors.purple, borderRadius: 5 },
});
