import React, { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { fitLockArtwork, UNLOCK_BOUNDS } from './lock-screen-layout.mjs';

const artwork = require('../assets/characters/security-screen-approved.png');

export default function SecurityLockScreen({ hidden, ready, busy, error, onUnlock }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const frame = fitLockArtwork(size.width, size.height);
  const button = {
    left: frame.width * UNLOCK_BOUNDS.left,
    top: frame.height * UNLOCK_BOUNDS.top,
    width: frame.width * UNLOCK_BOUNDS.width,
    height: frame.height * UNLOCK_BOUNDS.height,
    borderRadius: frame.height * UNLOCK_BOUNDS.height / 2,
  };
  return (
    <View style={styles.screen} accessibilityViewIsModal>
      <StatusBar style="light" />
      <Image source={artwork} style={[StyleSheet.absoluteFillObject, styles.background]} resizeMode="cover" blurRadius={24} accessible={false} />
      <View style={[StyleSheet.absoluteFillObject, styles.tint]} pointerEvents="none" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.stage} onLayout={({ nativeEvent: { layout } }) => setSize({ width: layout.width, height: layout.height })}>
          <View style={[styles.artworkFrame, frame]}>
            <Image source={artwork} style={[StyleSheet.absoluteFillObject, frame]} resizeMode="contain"
              accessibilityLabel="PayPlace. Money without Shame. Your place is protected. Unlock with Face ID, Touch ID, or your device passcode." />
            {!hidden && <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={busy ? 'Checking device authentication' : 'Unlock PayPlace'}
              accessibilityHint="Authenticate with your device to open PayPlace"
              accessibilityState={{ disabled: busy || !ready, busy }}
              disabled={busy || !ready}
              hitSlop={8}
              activeOpacity={0.65}
              style={[styles.button, button]}
              onPress={onUnlock}>
              {busy && <View style={styles.checking}><Text style={styles.checkingText}>Checking…</Text></View>}
            </TouchableOpacity>}
          </View>
          {!!error && <View style={styles.errorBanner}><Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>{error}</Text></View>}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#003F49' },
  background: { width: '100%', height: '100%' },
  tint: { backgroundColor: 'rgba(0, 40, 46, 0.65)' },
  safe: { flex: 1 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artworkFrame: { overflow: 'hidden' },
  button: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  checking: { width: '94%', height: '80%', borderRadius: 999, backgroundColor: '#6B2CFF', alignItems: 'center', justifyContent: 'center' },
  checkingText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  errorBanner: { position: 'absolute', top: 8, left: 16, right: 16, borderRadius: 16, padding: 14, backgroundColor: 'rgba(0, 36, 44, 0.95)' },
  error: { color: '#FFFFFF', fontSize: 16, lineHeight: 22, textAlign: 'center' },
});
