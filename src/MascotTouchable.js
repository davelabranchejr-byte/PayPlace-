import React, { forwardRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActionArtwork from './ActionArtwork';
import { actionForLabel } from './action-artwork.mjs';

function hasIllustration(children) {
  return React.Children.toArray(children).some(child => {
    if (!React.isValidElement(child)) return false;
    const name = child.type?.displayName || child.type?.name || (typeof child.type === 'string' ? child.type : '');
    return child.type === Image || /Artwork|Illustration|Scene|Portrait|Brand|Logo|BuildingMark|Glass|Quilt|FeatureArt/.test(name) || hasIllustration(child.props.children);
  });
}
function labelText(children) {
  return React.Children.toArray(children).map(child => typeof child === 'string' || typeof child === 'number' ? String(child) : React.isValidElement(child) ? labelText(child.props.children) : '').join(' ');
}
function readable(children, compact = false) {
  return React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    const name = child.type?.displayName || child.type?.name || child.type;
    if (child.type === Text || name === 'Text') {
      const original = StyleSheet.flatten(child.props.style) || {};
      const fontSize = Math.max(original.fontSize || 14, compact ? 13 : 17);
      return React.cloneElement(child, { style: [child.props.style, { fontSize, lineHeight: Math.max(original.lineHeight || 0, Math.ceil(fontSize * 1.3)), flexShrink: 1 } ] });
    }
    if (child.type === Image || /Artwork|Illustration|Scene|Portrait|Brand|Logo/.test(String(name))) return child;
    return child.props.children ? React.cloneElement(child, {}, readable(child.props.children, compact)) : child;
  });
}
function content(children, action, size, row, compact) {
  // Replace redundant stock glyphs while keeping the button's real text and
  // state. The action illustration stays decorative for screen-reader users.
  const kept = React.Children.toArray(children).filter(child => !React.isValidElement(child) || !/^(Ionicons|Icon)$/.test(child.type?.displayName || child.type?.name || ''));
  return <><ActionArtwork action={action} size={size}/><View style={{flexShrink:1,minWidth:0,maxWidth:'100%',flexDirection:row?'row':'column',alignItems:row?'center':undefined}}>{readable(kept,compact)}</View></>;
}
function ButtonRim({radius}) {
  return <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={{position:'absolute',left:2,right:2,top:2,bottom:2,borderRadius:radius-2,borderWidth:1,borderColor:'rgba(255,255,255,.55)'}}>
    <View style={{position:'absolute',left:6,right:6,top:2,height:10,borderTopWidth:2,borderTopColor:'rgba(255,255,255,.9)',borderRadius:radius}}/>
    <View style={{position:'absolute',left:6,right:6,bottom:2,height:10,borderBottomWidth:2,borderBottomColor:'rgba(19,37,71,.18)',borderRadius:radius}}/>
  </View>;
}
function decorate(style,view) {
  if(view.hotspot)return style;
  const frame={borderRadius:view.radius,borderWidth:2,borderColor:'rgba(255,255,255,.85)',backgroundColor:'#FFFFFF',shadowColor:'#132547',shadowOffset:{width:0,height:3},shadowOpacity:.19,shadowRadius:4,elevation:3,maxWidth:'100%'};
  const selected=view.selected?{borderColor:'#132547',borderWidth:3}:null;
  if(view.integrated)return [frame,style,{borderRadius:view.radius},selected];
  return [frame,style,{borderRadius:view.radius,minHeight:Math.max(view.flat.minHeight||0,view.compact?44:view.stacked?100:76),padding:Math.max(view.flat.padding||0,view.compact?6:12),flexDirection:view.stacked?'column':'row',alignItems:'center',justifyContent:'center',gap:view.compact?6:12},selected];
}
function settings({children,style,artworkMode,artworkAction,accessibilityLabel,accessibilityState,artworkSize=52,width=0}) {
  const flat=StyleSheet.flatten?.(typeof style==='function'?undefined:style)||{};
  const hotspot=artworkMode==='hotspot'||flat.position==='absolute';
  const integrated=artworkMode==='integrated'||hotspot||hasIllustration(children);
  const label=accessibilityLabel||labelText(children);
  const action=artworkAction||(accessibilityState?.expanded===false?'browse':actionForLabel(label));
  const compact=(typeof flat.width==='number'&&flat.width<=80)||(typeof flat.height==='number'&&flat.height<=56)||!!flat.aspectRatio;
  const stacked=!compact&&width>0&&width<240;
  return {flat,hotspot,integrated,action,compact,stacked,size:compact?Math.min(artworkSize,36):artworkSize,row:flat.flexDirection==='row',radius:Math.max(flat.borderRadius||0,compact?14:22),selected:!!accessibilityState?.selected};
}
export const MascotTouchable=forwardRef(function MascotTouchable({artworkMode,artworkAction,artworkSize,children,style,onLayout,...props},ref){
  const [width,setWidth]=useState(0);
  const view=settings({artworkMode,artworkAction,artworkSize,children,style,width,...props});
  return <TouchableOpacity ref={ref} {...props} onLayout={event=>{const next=event.nativeEvent.layout.width;setWidth(old=>old===next?old:next);onLayout?.(event);}} style={decorate(style,view)}>
    {view.integrated?(view.hotspot?children:readable(children,props.accessibilityRole==='tab')):content(children,view.action,view.size,view.row,view.compact)}
    {!view.hotspot&&<ButtonRim radius={view.radius}/>}
  </TouchableOpacity>;
});
export const MascotPressable=forwardRef(function MascotPressable({artworkMode,artworkAction,artworkSize,children,style,onLayout,...props},ref){
  const [width,setWidth]=useState(0);
  const config=(state,result)=>settings({artworkMode,artworkAction,artworkSize,children:result,style:typeof style==='function'?style(state):style,width,...props});
  const render=(state,result)=>{const view=config(state,result);return <>{view.integrated?(view.hotspot?result:readable(result)):content(result,view.action,view.size,view.row,view.compact)}{!view.hotspot&&<ButtonRim radius={view.radius}/>}</>;};
  return <Pressable ref={ref} {...props} onLayout={event=>{const next=event.nativeEvent.layout.width;setWidth(old=>old===next?old:next);onLayout?.(event);}} style={state=>decorate(typeof style==='function'?style(state):style,config(state,typeof children==='function'?children(state):children))}>{typeof children==='function'?state=>render(state,children(state)):render({},children)}</Pressable>;
});
