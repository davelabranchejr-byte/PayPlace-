import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { nextQuietDate } from './neighborhood-progress.mjs';
const ids=['payplace-annie-weekly','payplace-annie-away'];
let queue=Promise.resolve();
export const drainAnnieCare = () => queue.catch(() => {});
export default function useAnnieCare(settings, ready, onReturn, onOpen) {
  const latest=useRef();latest.current={settings,ready,onReturn,onOpen};
  const [status,setStatus]=useState({supported:true,error:false});
  useEffect(() => {
    function visit() { if (latest.current.ready) latest.current.onReturn(Date.now()); }
    visit();
    const sub=AppState.addEventListener('change',state => {if(state==='active')visit();});
    return () => sub.remove();
  },[ready]);
  useEffect(() => {
    if(!ready)return;
    let active=true;
    const job=queue.catch(()=>{}).then(async()=>{
      for(const id of ids) await Notifications.cancelScheduledNotificationAsync(id);
      const permission=await Notifications.getPermissionsAsync();
      if(!permission.granted && permission.ios?.status!==Notifications.IosAuthorizationStatus.PROVISIONAL)return;
      if(Platform.OS==='android') await Notifications.setNotificationChannelAsync('annie-private-reminders',{name:'Annie’s quiet reminders',importance:Notifications.AndroidImportance.LOW,sound:null,enableVibrate:false,lockscreenVisibility:Notifications.AndroidNotificationVisibility.PRIVATE});
      const content={sound:false,data:{kind:'payplace-annie-care'}};
      if(settings?.weekly) await Notifications.scheduleNotificationAsync({identifier:ids[0],content:{...content,title:'Your week with Annie',body:'Sweetheart, your weekly recap is waiting. Every small step matters.'},trigger:Platform.OS==='android'?{type:Notifications.SchedulableTriggerInputTypes.WEEKLY,weekday:1,hour:settings.hour??17,minute:settings.minute??0,channelId:'annie-private-reminders'}:{type:Notifications.SchedulableTriggerInputTypes.CALENDAR,weekday:1,hour:settings.hour??17,minute:settings.minute??0,repeats:true}});
      if(settings?.checkIn) await Notifications.scheduleNotificationAsync({identifier:ids[1],content:{...content,title:'The porch light is still on',body:'It’s Annie, sweetheart. The neighborhood misses you. How are you doing? No catching up required.'},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:nextQuietDate(7,settings.hour??17,new Date(settings.lastOpened || Date.now()),settings.minute??0),channelId:'annie-private-reminders'}});
    });
    queue=job;job.then(()=>{if(active)setStatus({supported:true,error:false});},()=>{if(active)setStatus({supported:true,error:true});});
    return()=>{active=false;};
  },[settings,ready]);
  useEffect(()=>{
    const open=response=>{if(response?.notification.request.content.data?.kind==='payplace-annie-care'){latest.current.onOpen();Notifications.clearLastNotificationResponseAsync().catch(()=>{});}};
    const sub=Notifications.addNotificationResponseReceivedListener(open);
    if(ready)Notifications.getLastNotificationResponseAsync().then(open).catch(()=>{});
    return()=>sub.remove();
  },[ready]);
  return status;
}
