import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
export default function useNeighborhoodClock() {
  const [now,setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = setInterval(() => {if(AppState.currentState === 'active')refresh();},30000);
    const app = AppState.addEventListener('change',state => {if(state === 'active')refresh();});
    return () => {clearInterval(timer);app.remove();};
  },[]);
  return now;
}
