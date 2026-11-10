import { MascotTouchable as TouchableOpacity, actionColors } from './MascotTouchable';
import React from 'react';
import ActionArtwork from './ActionArtwork';
import { actionForLabel } from './action-artwork.mjs';
import { StyleSheet, View } from 'react-native';
import { Text } from './Privacy';

export default function FeatureLinks({ items }) {
  return <View style={s.list}>{items.map(({title,body,onPress,artworkAction}) => <TouchableOpacity artworkMode="integrated" artworkAction={artworkAction||actionForLabel(title)} key={title} accessibilityRole="button" accessibilityLabel={`Open ${title}`} onPress={onPress} style={[s.item,{backgroundColor:actionColors(artworkAction||actionForLabel(title)).fill,borderColor:actionColors(artworkAction||actionForLabel(title)).border}]}>
    <ActionArtwork action={artworkAction||actionForLabel(title)} size={128}/>
    <View style={s.copy}><Text style={s.title}>{title}</Text>{body && <Text style={s.body}>{body}</Text>}</View>
    <View style={s.arrow} accessible={false} importantForAccessibility="no-hide-descendants"><Text style={s.arrowText}>›</Text></View>
  </TouchableOpacity>)}</View>;
}
const s=StyleSheet.create({list:{gap:14,marginBottom:18},item:{width:'100%',minHeight:164,padding:12,flexDirection:'row',flexWrap:'wrap',justifyContent:'center',alignItems:'center',gap:8,borderRadius:28,borderWidth:3},copy:{flexGrow:1,flexShrink:1,flexBasis:88,minWidth:0,gap:5},title:{fontSize:22,lineHeight:28,fontWeight:'900',color:'#071A3A'},body:{fontSize:15,lineHeight:21,color:'#173C50'},arrow:{width:32,height:40,borderRadius:20,backgroundColor:'#8734CF',borderWidth:2,borderColor:'#FFFFFF',justifyContent:'center',alignItems:'center'},arrowText:{fontSize:28,lineHeight:37,color:'#FFFFFF',fontWeight:'900'}});
