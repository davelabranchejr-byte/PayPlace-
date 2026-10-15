import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, Image, View, StyleSheet } from 'react-native';
import { isNeighborhoodNight } from './neighborhood-time.mjs';
import useNeighborhoodClock from './useNeighborhoodClock';
const day=require('../assets/characters/neighborhood-panorama-day.png');
const night=require('../assets/characters/neighborhood-panorama-night.png');
const butterfly=require('../assets/characters/monarch-butterfly.png');
const lamps=[[3,32],[10.4,25],[30.6,24],[48.6,34],[65.2,31],[80.2,17],[95.4,36]];
const flies=[[19,61],[28,72],[36,51],[44,77],[54,66],[61,55],[70,76],[80,61]];
function Glow({x,y,index,playing,firefly=false}) {
  const alpha=useRef(new Animated.Value(0.6)).current;
  const drift=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    alpha.setValue(firefly?0.45:0.65);drift.setValue(0);
    if(!playing)return undefined;
    const blink=Animated.loop(Animated.sequence([
      Animated.delay(index*173),
      Animated.timing(alpha,{toValue:firefly?0.02:0.4,duration:1400+index*61,useNativeDriver:true}),
      Animated.timing(alpha,{toValue:firefly?0.95:0.85,duration:900+index*91,useNativeDriver:true}),
    ]));
    const wander=Animated.loop(Animated.sequence([
      Animated.timing(drift,{toValue:1,duration:2700+index*83,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
      Animated.timing(drift,{toValue:0,duration:3100+index*71,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
    ]));
    blink.start();if(firefly)wander.start();
    return ()=>{blink.stop();wander.stop();};
  },[playing,firefly,index,alpha,drift]);
  return <Animated.View style={[s.glow,{left:`${x}%`,top:`${y}%`,opacity:alpha,
    transform:[{translateX:firefly?drift.interpolate({inputRange:[0,1],outputRange:[-5,9]}):0},
      {translateY:firefly?drift.interpolate({inputRange:[0,1],outputRange:[3,-7]}):0}]}]}>
    <View style={[s.halo,firefly&&s.flyHalo]}/>
    {firefly&&<><View style={s.wingLeft}/><View style={s.wingRight}/><View style={s.flyBody}/><View style={s.flyLight}/></>}
  </Animated.View>;
}
function Butterfly({width,index,playing}) {
  const flight=useRef(new Animated.Value(0)).current;
  const flap=useRef(new Animated.Value(1)).current;
  useEffect(()=>{
    flight.setValue(0);flap.setValue(1);
    if(!playing||!width)return undefined;
    const glide=Animated.loop(Animated.sequence([
      Animated.delay(index*2100),
      Animated.timing(flight,{toValue:1,duration:14500+index*3700,easing:Easing.linear,useNativeDriver:true}),
      Animated.delay(1100),
    ]));
    const wings=Animated.loop(Animated.sequence([
      Animated.timing(flap,{toValue:0.22,duration:170+index*35,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
      Animated.timing(flap,{toValue:1,duration:200+index*30,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
    ]));
    glide.start();wings.start();return ()=>{glide.stop();wings.stop();};
  },[width,index,playing,flight,flap]);
  return <Animated.View style={{position:'absolute',top:`${index?43:21}%`,left:playing?0:`${index?72:24}%`,
    transform:[{translateX:playing?flight.interpolate({inputRange:[0,1],outputRange:index?[width+35,-35]:[-35,width+35]}):0},
      {translateY:flight.interpolate({inputRange:[0,0.2,0.45,0.7,1],outputRange:[0,-9,6,-5,0]})},
      {rotate:flight.interpolate({inputRange:[0,0.3,0.7,1],outputRange:['-18deg','12deg','-10deg','16deg']})}]}}>
    <Animated.Image source={butterfly} resizeMode="contain" accessible={false}
      style={{width:index?23:29,height:index?23:29,transform:[{scaleX:flap}]}}/>
  </Animated.View>;
}
export default function LivingNeighborhood({reduceAnimation=false}) {
  const now=useNeighborhoodClock();
  const [reduce,setReduce]=useState(true);
  const [active,setActive]=useState(AppState.currentState==='active');
  const [width,setWidth]=useState(0);
  useEffect(()=>{
    let mounted=true;
    AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(mounted)setReduce(value);}).catch(()=>{});
    const motion=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduce);
    const app=AppState.addEventListener('change',state=>setActive(state==='active'));
    return ()=>{mounted=false;motion.remove();app.remove();};
  },[]);
  const dark=isNeighborhoodNight(now);
  const playing=active&&!reduce&&!reduceAnimation;
  return <View style={s.scene} onLayout={event=>setWidth(event.nativeEvent.layout.width)} accessible accessibilityRole="image"
    accessibilityLabel={dark?'PayPlace at night: glowing lanterns, twinkling lights and blinking fireflies.':'PayPlace by day: realistic monarch butterflies flutter among the treehouses.'}>
    <Image source={dark?night:day} resizeMode="contain" style={s.image} accessible={false}/>
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFillObject}>
      {dark?<>
        {lamps.map(([x,y],index)=><Glow key={`lamp-${index}`} x={x} y={y} index={index} playing={playing}/>)}
        {flies.map(([x,y],index)=><Glow key={`fly-${index}`} x={x} y={y} index={index} playing={playing} firefly/>)}
      </>:[0,1].map(index=><Butterfly key={index} index={index} width={width} playing={playing}/>)}
    </View>
  </View>;
}
const s=StyleSheet.create({
  scene:{width:'100%',aspectRatio:3,overflow:'hidden',borderRadius:14,marginTop:8,backgroundColor:'#173C50'},image:{width:'100%',height:'100%'},
  glow:{position:'absolute',width:24,height:24,marginLeft:-12,marginTop:-12,alignItems:'center',justifyContent:'center'},
  halo:{position:'absolute',width:24,height:24,borderRadius:12,backgroundColor:'#FFCD5C33',shadowColor:'#FFD36C',shadowOpacity:0.9,shadowRadius:9,shadowOffset:{width:0,height:0}},
  flyHalo:{width:10,height:10,borderRadius:5,backgroundColor:'#C5FA6933',shadowColor:'#D4FF74',shadowRadius:5},
  flyBody:{position:'absolute',width:1.5,height:4,borderRadius:1,backgroundColor:'#665439'},
  wingLeft:{position:'absolute',width:3,height:1.5,backgroundColor:'#EEEBC477',borderRadius:2,transform:[{translateX:-2},{rotate:'-20deg'}]},
  wingRight:{position:'absolute',width:3,height:1.5,backgroundColor:'#EEEBC477',borderRadius:2,transform:[{translateX:2},{rotate:'20deg'}]},
  flyLight:{position:'absolute',width:2.5,height:2.5,borderRadius:2,backgroundColor:'#E5FF94',transform:[{translateY:2}]},
});
