import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Image, View, StyleSheet } from 'react-native';
import { isNeighborhoodNight } from './neighborhood-time.mjs';
const original=require('../assets/characters/annie-red-door-village.png');
const night=require('../assets/characters/annie-red-door-village-night.png');
const autumn=require('../assets/characters/neighborhood-autumn.png');
function Light({x,y,star,index,moving}) {
  const alpha=useRef(new Animated.Value(0.45)).current;
  useEffect(()=>{
    if(!moving){alpha.setValue(0.5);return;}
    const animation=Animated.loop(Animated.sequence([
      Animated.delay(index*137),Animated.timing(alpha,{toValue:0.9,duration:star?1600+index*179:350+index*83,useNativeDriver:true}),
      Animated.timing(alpha,{toValue:star?0.15:0.35,duration:star?2100+index*139:650+index*73,useNativeDriver:true})
    ]));animation.start();return()=>animation.stop();
  },[moving,alpha,index,star]);
  const Layer=moving?Animated.View:View;
  return <Layer style={{position:'absolute',left:`${x}%`,top:`${y}%`,width:star?7:30,height:star?7:30,marginLeft:star?-3:-15,marginTop:star?-3:-15,opacity:moving?alpha:0.5}}>
    {star?<><View style={{position:'absolute',left:3,width:1,height:7,backgroundColor:'#FFFCE6'}}/><View style={{position:'absolute',top:3,height:1,width:7,backgroundColor:'#FFFCE6'}}/></>: [30,24,18,12,6].map(size=><View key={size} style={{position:'absolute',width:size,height:size,left:(30-size)/2,top:(30-size)/2,borderRadius:size/2,backgroundColor:'rgba(255,192,73,0.09)'}}/>)}
  </Layer>;
}
export default function LivingNeighborhood() {
  const [now,setNow]=useState(()=>new Date());
  const [reduce,setReduce]=useState(true);
  const [active,setActive]=useState(AppState.currentState==='active');
  useEffect(()=>{
    let mounted=true;AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(mounted)setReduce(value);}).catch(()=>{});
    const motion=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduce);
    const app=AppState.addEventListener('change',state=>{setActive(state==='active');if(state==='active')setNow(new Date());});
    const timer=setInterval(()=>{if(AppState.currentState==='active')setNow(new Date());},60000);
    return()=>{mounted=false;motion.remove();app.remove();clearInterval(timer);};
  },[]);
  const fall=now.getMonth()===9 || now.getMonth()===10;
  const dark=isNeighborhoodNight(now);
  return <View style={s.scene}>
    <Image source={fall?autumn:dark?night:original} resizeMode="contain" style={s.image} accessibilityLabel={fall?"PayPlace’s autumn neighborhood with pumpkins, friendly ghosts, Budget Sisters, bill zombies and Bobbie the Bill Slayer. Annie’s door and treehouses remain open.":"Annie’s welcoming treehouse neighborhood"}/>
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFillObject}>
      {[[16,8],[60,17],[73,21],[96,10],[39,65],[56,66]].map(([x,y],index)=><Light key={`lamp-${index}`} x={x} y={y} index={index} moving={!reduce&&active}/>) }
      {(dark||fall)&&[[84,15],[92,7],[81,19],[89,22],[71,27]].map(([x,y],index)=><Light key={`star-${index}`} x={x} y={y} star index={index} moving={!reduce&&active}/>) }
    </View>
  </View>;
}
const s=StyleSheet.create({scene:{width:'100%',aspectRatio:16/9,overflow:'hidden'},image:{width:'100%',height:'100%'}});
