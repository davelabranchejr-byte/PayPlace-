import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Privacy';

export default function FeatureLinks({ items }) {
  return <View style={s.list}>{items.map(({title,body,onPress}) => <TouchableOpacity key={title} accessibilityRole="button" accessibilityLabel={`Open ${title}`} onPress={onPress} style={s.item}>
    <View style={{flex:1}}><Text style={s.title}>{title}</Text>{body && <Text style={s.body}>{body}</Text>}</View><Text style={s.arrow}>›</Text>
  </TouchableOpacity>)}</View>;
}
const s=StyleSheet.create({list:{gap:8,marginBottom:16},item:{minHeight:56,padding:14,flexDirection:'row',alignItems:'center',gap:12,borderRadius:16,backgroundColor:'#F4F0FD',borderWidth:1,borderColor:'#D4C9ED'},title:{fontSize:16,fontWeight:'800',color:'#173C50'},body:{fontSize:13,lineHeight:19,color:'#475569',marginTop:3},arrow:{fontSize:25,color:'#6550AF'}});
