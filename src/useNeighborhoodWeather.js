import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { fetchNeighborhoodWeather, isWeatherZip, weatherRefreshMs } from './neighborhood-local-weather.mjs';

// Keep the last refresh in memory so switching tabs does not repeat lookups.
let lastWeather;

export default function useNeighborhoodWeather(zip) {
  const [result, setResult] = useState(() => lastWeather?.zip === zip ? lastWeather : null);
  useEffect(() => {
    if (!isWeatherZip(zip)) {
      setResult(null);
      return;
    }
    const cached = lastWeather?.zip === zip ? lastWeather : null;
    if (cached && Date.now() - cached.at < weatherRefreshMs) setResult(cached);
    else setResult(null);
    let current, timeout, cancelled = false, lastAttempt = cached?.at ?? -Infinity;
    const refresh = () => {
      const now = Date.now();
      if (AppState.currentState !== 'active' || now - lastAttempt < weatherRefreshMs) return;
      lastAttempt = now;
      current = new AbortController();
      timeout = setTimeout(() => current.abort(), 15000);
      const complete = weather => {
        if (!cancelled) {
          lastWeather = { zip, weather, at: now };
          setResult(lastWeather);
        }
      };
      fetchNeighborhoodWeather(zip, { request: fetch, signal: current.signal, now, native: Platform.OS !== 'web' })
        .then(complete, () => complete(null))
        .finally(() => clearTimeout(timeout));
    };
    refresh();
    const timer = setInterval(refresh, weatherRefreshMs);
    const app = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => {
      cancelled = true;
      current?.abort();
      clearTimeout(timeout);
      clearInterval(timer);
      app.remove();
    };
  }, [zip]);
  return result && result.zip === zip ? result.weather : undefined;
}
