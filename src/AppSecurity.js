import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Image, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { BACKGROUND_LOCK_MS, IDLE_LOCK_MS, needsResumeAuthentication } from './security-policy.mjs';
const Context = createContext(null);
const PREF_KEY = 'payplace.app.lock.v1';
export const useAppSecurity = () => useContext(Context);

export default function AppSecurity({ children }) {
  const native = Platform.OS !== 'web';
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(native);
  const [available, setAvailable] = useState(false);
  const [unlockedOnce, setUnlockedOnce] = useState(!native);
  const [locked, setLocked] = useState(native);
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const enabledRef = useRef(native);
  const lockedRef = useRef(native);
  const authenticating = useRef(false);
  const lastInteraction = useRef(Date.now());
  const leftAt = useRef(null);
  const backgroundTimer = useRef(null);
  const alive = useRef(true);
  const lock = () => { lockedRef.current = true; setLocked(true); };

  useEffect(() => {
    alive.current = true;
    (async () => {
      try {
        if (!native) { setEnabled(false); enabledRef.current = false; setReady(true); return; }
        const [pref, level] = await Promise.all([SecureStore.getItemAsync(PREF_KEY), LocalAuthentication.getEnrolledLevelAsync()]);
        if (!alive.current) return;
        const canAuthenticate = level >= LocalAuthentication.SecurityLevel.SECRET;
        setAvailable(canAuthenticate);
        const active = pref === null ? canAuthenticate : pref === 'enabled';
        if (pref === null && active) await SecureStore.setItemAsync(PREF_KEY, 'enabled');
        if (!alive.current) return;
        setEnabled(active); enabledRef.current = active;
        if (!active) { lockedRef.current = false; setLocked(false); setUnlockedOnce(true); }
        setReady(true);
      } catch { if (alive.current) { setError('Could not check device security. Close and reopen PayPlace to try again.'); } }
    })();
    const subscription = AppState.addEventListener('change', state => {
      if (!native || authenticating.current) return;
      if (state !== 'active') {
        setHidden(true);
        if (leftAt.current === null) leftAt.current = Date.now();
        if (enabledRef.current && !backgroundTimer.current) backgroundTimer.current = setTimeout(lock, BACKGROUND_LOCK_MS);
      } else {
        clearTimeout(backgroundTimer.current); backgroundTimer.current = null;
        if (enabledRef.current && needsResumeAuthentication(leftAt.current, Date.now())) lock();
        leftAt.current = null; setHidden(false); lastInteraction.current = Date.now();
      }
    });
    const idle = setInterval(() => {
      if (enabledRef.current && !lockedRef.current && !authenticating.current && Date.now() - lastInteraction.current >= IDLE_LOCK_MS) lock();
    }, 1000);
    return () => { alive.current = false; subscription.remove(); clearInterval(idle); clearTimeout(backgroundTimer.current); };
  }, []);

  async function authenticate(promptMessage = 'Unlock PayPlace') {
    if (!native || authenticating.current) return false;
    authenticating.current = true; setBusy(true); setError('');
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel: 'Cancel', fallbackLabel: 'Use device passcode', disableDeviceFallback: false, biometricsSecurityLevel: 'strong' });
      if (!alive.current || AppState.currentState === 'background') return false;
      if (!result.success) { setError('PayPlace stays locked. Try again using your biometrics or device passcode.'); return false; }
      lastInteraction.current = Date.now(); leftAt.current = null; setHidden(false); setAvailable(true);
      return true;
    } catch { setError('Device authentication is unavailable. Check your phone’s security settings and try again.'); return false; }
    finally { authenticating.current = false; if (alive.current) setBusy(false); }
  }
  async function unlock() {
    if (await authenticate()) { lockedRef.current = false; setLocked(false); setUnlockedOnce(true); }
  }
  async function setAppLock(next) {
    if (!native || !(await authenticate(next ? 'Enable PayPlace app lock' : 'Turn off PayPlace app lock'))) return;
    try {
      await SecureStore.setItemAsync(PREF_KEY, next ? 'enabled' : 'disabled');
      enabledRef.current = next; setEnabled(next); setError('');
    } catch { throw new Error('Could not save the app lock preference.'); }
  }
  function touch() { lastInteraction.current = Date.now(); }
  const cover = (
    <SafeAreaView style={styles.lock} accessibilityViewIsModal>
      <ScrollView contentContainerStyle={styles.lockContent} style={styles.lockScroll}>
      <Image source={require('../assets/characters/lock-annie-fort-knox-family.png')} style={styles.lockArtwork} resizeMode="contain" accessibilityLabel="Daddy, Bobbie, Westley, Tate and Chapo secure Annie's red door and windows with shiny brass locks" />
      <Ionicons name="shield-checkmark" size={56} color="#0BB9AC" />
      <Text style={styles.title}>Your place is protected.</Text>
      <Text style={styles.body}>{hidden ? 'Your financial details stay out of view.' : 'Unlock with Face ID, Touch ID, or your device passcode.'}</Text>
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      {!hidden && ready && <TouchableOpacity accessibilityRole="button" disabled={busy} style={styles.button} onPress={unlock}><Text style={styles.buttonText}>{busy ? 'Checking…' : 'Unlock PayPlace'}</Text></TouchableOpacity>}
      </ScrollView>
    </SafeAreaView>
  );
  return (
    <Context.Provider value={{ native, enabled, available, busy, authenticate, setAppLock, lock, touch }}>
      <View style={{ flex: 1 }} onTouchStart={touch} onAccessibilityTap={touch}>
        {ready && unlockedOnce ? <View style={{ flex: 1, opacity: native && (hidden || locked) ? 0 : 1 }} pointerEvents={native && (hidden || locked) ? 'none' : 'auto'} accessibilityElementsHidden={native && (hidden || locked)} importantForAccessibility={native && (hidden || locked) ? 'no-hide-descendants' : 'auto'}>{children}</View> : cover}
        {ready && unlockedOnce && <Modal visible={native && (hidden || locked)} animationType="none" onRequestClose={() => {}}>{cover}</Modal>}
      </View>
    </Context.Provider>
  );
}
const styles = StyleSheet.create({
  lock: { flex: 1, backgroundColor: '#F5FBFF' },
  lockScroll: { flex: 1 },
  lockContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  lockArtwork: { width: '100%', maxWidth: 420, aspectRatio: 3 / 2, borderRadius: 24, marginBottom: 24 },
  title: { fontSize: 27, fontWeight: '800', color: '#0B1F40', textAlign: 'center', marginTop: 24 },
  body: { fontSize: 17, color: '#52647A', textAlign: 'center', lineHeight: 25, marginVertical: 18 },
  error: { color: '#A63744', textAlign: 'center', marginBottom: 18 },
  button: { backgroundColor: '#6650E9', borderRadius: 24, paddingHorizontal: 30, paddingVertical: 18 },
  buttonText: { color: 'white', fontSize: 17, fontWeight: '800' },
});
