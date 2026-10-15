import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Measure a layout-only frame before mounting a native image. Native Image
// supplies intrinsic asset dimensions unless BOTH dimensions are overridden.
export default function FittedArtwork({source,aspectRatio,style,children,testID,onLayout,accessibilityLabel,accessible=true}) {
  const [bounds,setBounds]=useState({width:0,height:0});
  return <View testID={testID} style={[s.frame,aspectRatio?{aspectRatio}:null,style]}
    accessible={accessible} accessibilityRole={accessible?'image':undefined} accessibilityLabel={accessibilityLabel}
    onLayout={event=>{
      const {width,height}=event.nativeEvent.layout;
      setBounds(previous=>previous.width===width&&previous.height===height?previous:{width,height});
      if(onLayout)onLayout(event);
    }}>
    {bounds.width>0&&bounds.height>0&&<Image source={source} resizeMode="contain" accessible={false}
      testID={testID?`${testID}-image`:undefined}
      style={{position:'absolute',left:0,top:0,width:bounds.width,height:bounds.height}}/>}
    {children}
  </View>;
}
const s=StyleSheet.create({frame:{width:'100%',overflow:'hidden'}});
