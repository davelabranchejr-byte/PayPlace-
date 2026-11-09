import React, { forwardRef } from 'react';
import { Image, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
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
function content(children, action, size, row) {
  // Replace redundant stock glyphs while keeping the button's real text and
  // state. The action illustration stays decorative for screen-reader users.
  const kept = React.Children.toArray(children).filter(child => !React.isValidElement(child) || !/^(Ionicons|Icon)$/.test(child.type?.displayName || child.type?.name || ''));
  return <><ActionArtwork action={action} size={size}/><View style={{flexShrink:1,minWidth:0,flexDirection:row?'row':'column',alignItems:row?'center':undefined}}>{kept}</View></>;
}
function decorate(style) { return [style,{minHeight:48,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8}]; }
function settings({children,style,artworkMode,artworkAction,accessibilityLabel,accessibilityState,artworkSize=30}) {
  const flat=StyleSheet.flatten?.(typeof style==='function'?undefined:style)||{};
  const integrated=artworkMode==='integrated'||artworkMode==='hotspot'||flat.position==='absolute'||hasIllustration(children);
  const label=accessibilityLabel||labelText(children);
  const action=artworkAction||(accessibilityState?.expanded===false?'browse':actionForLabel(label));
  return {integrated,action,size:artworkSize,row:flat.flexDirection==='row'};
}
export const MascotTouchable=forwardRef(function MascotTouchable({artworkMode,artworkAction,artworkSize,children,style,...props},ref){
  const view=settings({artworkMode,artworkAction,artworkSize,children,style,...props});
  return <TouchableOpacity ref={ref} {...props} style={view.integrated?style:decorate(style)}>{view.integrated?children:content(children,view.action,view.size,view.row)}</TouchableOpacity>;
});
export const MascotPressable=forwardRef(function MascotPressable({artworkMode,artworkAction,artworkSize,children,style,...props},ref){
  const view=settings({artworkMode,artworkAction,artworkSize,children,style,...props});
  return <Pressable ref={ref} {...props} style={view.integrated?style:state=>decorate(typeof style==='function'?style(state):style)}>{typeof children==='function'?state=>{const result=children(state);return view.integrated?result:content(result,view.action,view.size,view.row);}:view.integrated?children:content(children,view.action,view.size,view.row)}</Pressable>;
});
