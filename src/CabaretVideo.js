import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { EMAIL_SERVICE_ORIGIN } from './email-api.mjs';

export const CABARET_VIDEO_SOURCE = { uri: `${EMAIL_SERVICE_ORIGIN}/cabaret/meowgarita-and-money.mp4`, contentType: 'progressive' };

function Playback({ onRetry }) {
  const [status, setStatus] = useState('loading');
  // Start with no source so loading a remote movie never blocks the native UI.
  const player = useVideoPlayer(null, instance => {
    instance.loop = false;
    instance.staysActiveInBackground = false;
  });
  useEffect(() => {
    let active = true;
    const statusSubscription = player.addListener('statusChange', event => {
      if (active) setStatus(event.status);
    });
    const appSubscription = AppState.addEventListener('change', next => {
      if (next !== 'active') player.pause();
    });
    player.replaceAsync(CABARET_VIDEO_SOURCE).then(() => {
      if (active && AppState.currentState === 'active') player.play();
    }).catch(() => { if (active) setStatus('error'); });
    return () => {
      active = false;
      statusSubscription.remove();
      appSubscription.remove();
      // useVideoPlayer releases the native player when this screen unmounts.
    };
  }, [player]);
  return <View style={s.screen}>
    <View style={s.frame}>
      <VideoView testID="cabaret-video" player={player} style={s.video} contentFit="contain" nativeControls
        fullscreenOptions={{ enable: true }} allowsPictureInPicture={false} startsPictureInPictureAutomatically={false}
        playsInline accessibilityLabel="Meowgarita and Money — full video, with playback controls" />
    </View>
    {status === 'loading' && <View style={s.status} accessibilityLiveRegion="polite"><ActivityIndicator color="#FFE1A0" /><Text style={s.text}>Getting the stage ready…</Text></View>}
    {status === 'error' && <View style={s.status} accessibilityLiveRegion="polite">
      <Text style={s.text}>The show could not load. Check your connection and try again.</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Try loading the show again" onPress={onRetry} style={s.retry}><Text style={s.retryText}>Try again</Text></TouchableOpacity>
    </View>}
    <Text style={s.note}>The whole picture fits inside the player. Use the controls to pause, replay, or watch full screen.</Text>
  </View>;
}

export default function CabaretVideo() {
  const [attempt, setAttempt] = useState(0);
  return <Playback key={attempt} onRetry={() => setAttempt(value => value + 1)} />;
}
const s = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, backgroundColor: '#190B22' },
  frame: { flex: 1, minHeight: 0, backgroundColor: '#000000' },
  video: { width: '100%', height: '100%' },
  status: { padding: 14, gap: 10, alignItems: 'center' },
  text: { color: '#FFF2F9', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  note: { padding: 14, color: '#D6C4DD', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retry: { padding: 14, minHeight: 48, backgroundColor: '#FFE1A0', borderRadius: 12 },
  retryText: { color: '#29102E', fontWeight: '800', fontSize: 16 },
});
