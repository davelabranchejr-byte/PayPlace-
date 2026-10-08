import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Modal, Platform, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import SecurityLockScreen from './SecurityLockScreen';
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
    <SecurityLockScreen hidden={hidden} ready={ready} busy={busy} error={error} onUnlock={unlock} />
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
