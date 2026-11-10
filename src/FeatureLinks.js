import { MascotTouchable as TouchableOpacity, actionColors } from './MascotTouchable';
import React, {useState} from 'react';
import ActionArtwork from './ActionArtwork';
import { actionForLabel } from './action-artwork.mjs';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from './Privacy';

export default function FeatureLinks({ items }) {
  return <View style={s.list}>{items.map(item=><FeatureLink key={item.title} {...item}/>)}</View>;
}
function FeatureLink({title,body,onPress,artworkAction}) {
  const [width,setWidth]=useState(0);
  const {fontScale}=useWindowDimensions();
  const stacked=(width>0&&width<320)||fontScale>1.2;
  const action=artworkAction||actionForLabel(title),colors=actionColors(action);
  const size=stacked||width===0||width>=360?128:96;
  return <TouchableOpacity artworkMode="integrated" artworkAction={action} accessibilityRole="button" accessibilityLabel={`Open ${title}`} onPress={onPress}
    onLayout={event=>setWidth(event.nativeEvent.layout.width)} style={[s.item,{flexDirection:stacked?'column':'row',backgroundColor:colors.fill,borderColor:colors.border}]}>
    <ActionArtwork action={action} size={size}/>
    <View style={[s.details,stacked?{width:'100%'}:{flex:1}]}>
      <View style={s.copy}><Text style={s.title} numberOfLines={title==='Neighborhood'&&!stacked?1:undefined} adjustsFontSizeToFit={title==='Neighborhood'&&!stacked} minimumFontScale={0.85}>{title}</Text>{body&&<Text style={s.body}>{body}</Text>}</View>
      <View style={s.arrow} accessible={false} importantForAccessibility="no-hide-descendants"><Text style={s.arrowText}>›</Text></View>
    </View>
  </TouchableOpacity>;
}
const s=StyleSheet.create({list:{gap:14,marginBottom:18},item:{width:'100%',minHeight:164,padding:12,justifyContent:'center',alignItems:'center',gap:12,borderRadius:28,borderWidth:3},details:{flexDirection:'row',alignItems:'center',gap:8,minWidth:0},copy:{flex:1,minWidth:0,gap:5},title:{fontSize:22,lineHeight:28,fontWeight:'900',color:'#071A3A'},body:{fontSize:15,lineHeight:21,color:'#173C50'},arrow:{width:32,height:40,borderRadius:20,backgroundColor:'#8734CF',borderWidth:2,borderColor:'#FFFFFF',justifyContent:'center',alignItems:'center'},arrowText:{fontSize:28,lineHeight:37,color:'#FFFFFF',fontWeight:'900'}});
