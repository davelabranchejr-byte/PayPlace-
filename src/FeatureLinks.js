import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React from 'react';
import ActionArtwork from './ActionArtwork';
import { actionForLabel } from './action-artwork.mjs';
import { StyleSheet, View } from 'react-native';
import { Text } from './Privacy';

export default function FeatureLinks({ items }) {
  return <View style={s.list}>{items.map(({title,body,onPress,artworkAction}) => <TouchableOpacity artworkMode="integrated" key={title} accessibilityRole="button" accessibilityLabel={`Open ${title}`} onPress={onPress} style={s.item}>
    <ActionArtwork action={artworkAction||actionForLabel(title)} size={128}/>
    <View style={s.copy}><Text style={s.title}>{title}</Text>{body && <Text style={s.body}>{body}</Text>}</View>
  </TouchableOpacity>)}</View>;
}
const s=StyleSheet.create({list:{gap:12,marginBottom:16},item:{minHeight:204,padding:18,alignItems:'center',gap:12,borderRadius:24,backgroundColor:'#F4F0FD',borderWidth:2,borderColor:'#D4C9ED'},copy:{width:'100%',alignItems:'center',gap:4},title:{fontSize:20,lineHeight:26,fontWeight:'800',color:'#173C50',textAlign:'center'},body:{fontSize:16,lineHeight:23,color:'#475569',textAlign:'center'}});
