import React, { forwardRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActionArtwork, { ACTION_ARTWORK } from './ActionArtwork';

function hasIllustration(children) {
  return React.Children.toArray(children).some(child => {
    if (!React.isValidElement(child)) return false;
    const name = child.type?.displayName || child.type?.name || (typeof child.type === 'string' ? child.type : '');
    return child.type === Image || /Artwork|Illustration|Scene|Portrait|Brand|Logo|BuildingMark|Glass|Quilt|FeatureArt/.test(name) || hasIllustration(child.props.children);
  });
}
function readable(children, compact = false, ink) {
  return React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    const name = child.type?.displayName || child.type?.name || child.type;
    if (child.type === Text || name === 'Text') {
      const original = StyleSheet.flatten(child.props.style) || {};
      const fontSize = Math.max(original.fontSize || 14, compact ? 13 : 18);
      return React.cloneElement(child, { style: [child.props.style, { fontSize, lineHeight: Math.max(original.lineHeight || 0, Math.ceil(fontSize * 1.3)), flexShrink: 1, ...(ink ? {color:ink} : {}) } ] });
    }
    if (child.type === Image || /Artwork|Illustration|Scene|Portrait|Brand|Logo/.test(String(name))) return child;
    return child.props.children ? React.cloneElement(child, {}, readable(child.props.children, compact, ink)) : child;
  });
}
function content(children, action, size, row, compact, ink) {
  // Replace redundant stock glyphs while keeping the button's real text and
  // state. The action illustration stays decorative for screen-reader users.
  const kept = React.Children.toArray(children).filter(child => !React.isValidElement(child) || !/^(Ionicons|Icon)$/.test(child.type?.displayName || child.type?.name || ''));
  return <><ActionArtwork action={action} size={size}/><View style={{flexShrink:1,minWidth:0,maxWidth:'100%',flex:row?1:undefined,flexDirection:'column',alignItems:'center'}}>{readable(kept,compact,ink)}</View></>;
}
function ButtonRim({radius}) {
  return <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={{position:'absolute',left:2,right:2,top:2,bottom:2,borderRadius:radius-2,borderWidth:1,borderColor:'rgba(255,255,255,.55)'}}>
    <View style={{position:'absolute',left:6,right:6,top:2,height:10,borderTopWidth:2,borderTopColor:'rgba(255,255,255,.9)',borderRadius:radius}}/>
    <View style={{position:'absolute',left:6,right:6,bottom:2,height:10,borderBottomWidth:2,borderBottomColor:'rgba(19,37,71,.18)',borderRadius:radius}}/>
  </View>;
}
// A bright frame around the original artwork, shared by every action control.
export function actionColors(action) {
  if (['save','approve','banking','budget','refresh','reviewBills','billTools','paymentHistory'].includes(action)) return {fill:'#65EBEF',border:'#00AABF'};
  if (['remove','reject','close','firstWin','annieCare'].includes(action)) return {fill:'#FFB0A4',border:'#E65D60'};
  if (['mail','add','savings','remember','savingsGoal','payday','mailbox','neighborhood'].includes(action)) return {fill:'#FFE455',border:'#E1AC00'};
  return {fill:'#DCABFF',border:'#9F3DE5'};
}
const quietSurfaces = new Set(['white','#FFF','#FFFFFF','#F7F3FF','#F4F0FD','#EEE9FF','#EEE8FF','#EEE7FF','#F3EEFF','#EBDDFF','#C9FFF4','#FFF2A8','#FFE1DD']);
function decorate(style,view) {
  if(view.hotspot)return style;
  const colors=actionColors(view.action);
  const frame={borderRadius:view.radius,borderWidth:2,borderColor:colors.border,backgroundColor:colors.fill,shadowColor:'#132547',shadowOffset:{width:0,height:3},shadowOpacity:.12,shadowRadius:4,elevation:2,maxWidth:'100%'};
  const selected=view.selected?{borderColor:'#132547',borderWidth:3}:null;
  // Refresh neutral shared controls without replacing selected, disabled,
  // pressed or deliberately colored states supplied by their screens.
  const surface=quietSurfaces.has(view.flat.backgroundColor)?{backgroundColor:colors.fill,borderColor:colors.border}:null;
  if(view.integrated) {
    const touchTarget = view.plain && !view.flat.height && !view.flat.aspectRatio
      ? { minHeight: Math.max(view.flat.minHeight || 0, 44) }
      : null;
    return [frame,style,surface,{borderRadius:view.radius},touchTarget,selected];
  }
  return [frame,style,surface,{borderRadius:view.radius,minHeight:Math.max(view.flat.minHeight||0,view.fixedSmall?44:view.compact?80:view.stacked?164:148),padding:Math.max(view.flat.padding||0,view.fixedSmall?4:view.compact?8:14),flexDirection:view.stacked?'column':'row',alignItems:'center',justifyContent:'center',gap:view.fixedSmall?4:view.compact?8:12},selected];
}
function settings({children,style,artworkMode,artworkAction,accessibilityState,artworkSize=112,width=0}) {
  const flat=StyleSheet.flatten?.(typeof style==='function'?undefined:style)||{};
  const hotspot=artworkMode==='hotspot'||flat.position==='absolute';
  const action=artworkAction;
  const hasArt = artworkMode === 'integrated' || hotspot || hasIllustration(children);
  const plain = !hasArt && !Object.hasOwn(ACTION_ARTWORK, action);
  const integrated = hasArt || plain;
  const fixedSmall=(typeof flat.width==='number'&&flat.width<=80)||(typeof flat.height==='number'&&flat.height<=56)||!!flat.aspectRatio;
  const compact=artworkMode==='compact'||fixedSmall;
  // Wide controls follow the approved landscape banners. Narrow tiles stack
  // instead of squeezing the artwork or truncating a caption.
  const stacked=!compact && width<300;
  const fixedSize=typeof flat.width==='number'?Math.max(20,flat.width-16):36;
  const size=compact?Math.min(artworkSize,fixedSmall?fixedSize:64):Math.min(artworkSize,width>0?Math.max(48,width-32):artworkSize);
  return {flat,hotspot,integrated,plain,action,ink:!flat.backgroundColor||quietSurfaces.has(flat.backgroundColor)?'#071A3A':undefined,compact,fixedSmall,stacked,size,row:!stacked&&(!compact||flat.flexDirection==='row'),radius:Math.max(flat.borderRadius||0,compact?14:22),selected:!!accessibilityState?.selected};
}
export const MascotTouchable=forwardRef(function MascotTouchable({artworkMode,artworkAction,artworkSize,children,style,onLayout,...props},ref){
  const [width,setWidth]=useState(0);
  const view=settings({artworkMode,artworkAction,artworkSize,children,style,width,...props});
  return <TouchableOpacity ref={ref} {...props} onLayout={event=>{const next=event.nativeEvent.layout.width;setWidth(old=>old===next?old:next);onLayout?.(event);}} style={decorate(style,view)}>
    {view.integrated?(view.hotspot?children:readable(children,props.accessibilityRole==='tab',view.ink)):content(children,view.action,view.size,view.row,view.compact,view.ink)}
    {!view.hotspot&&<ButtonRim radius={view.radius}/>}
  </TouchableOpacity>;
});
export const MascotPressable=forwardRef(function MascotPressable({artworkMode,artworkAction,artworkSize,children,style,onLayout,...props},ref){
  const [width,setWidth]=useState(0);
  const config=(state,result)=>settings({artworkMode,artworkAction,artworkSize,children:result,style:typeof style==='function'?style(state):style,width,...props});
  const render=(state,result)=>{const view=config(state,result);return <>{view.integrated?(view.hotspot?result:readable(result,false,view.ink)):content(result,view.action,view.size,view.row,view.compact,view.ink)}{!view.hotspot&&<ButtonRim radius={view.radius}/>}</>;};
  return <Pressable ref={ref} {...props} onLayout={event=>{const next=event.nativeEvent.layout.width;setWidth(old=>old===next?old:next);onLayout?.(event);}} style={state=>decorate(typeof style==='function'?style(state):style,config(state,typeof children==='function'?children(state):children))}>{typeof children==='function'?state=>render(state,children(state)):render({},children)}</Pressable>;
});
