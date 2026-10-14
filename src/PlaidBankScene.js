import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from './Privacy';
import CharacterArtwork from './CharacterArtwork';

const family = require('../assets/characters/references/family-reference.png');
const annie = require('../assets/characters/references/annie-canonical.jpg');
const logo = require('../assets/branding/payplace-locked-logo.jpeg');
const staff = [
  {name:'Westley', crop:[35,405,330,300], color:'#08796E'},
  {name:'Bobbie', crop:[735,310,350,330], color:'#6550AF'},
  {name:'Tate', crop:[390,600,325,280], color:'#CA593D'},
  {name:'Chapo', crop:[1000,560,340,280], color:'#A16D00'},
];
function PlaidUniform({color}) {
  return <View style={[s.uniform,{backgroundColor:color}]}>
    {[15,40,65,90].map(left=><View key={`v${left}`} style={[s.stripe,{left:`${left}%`,top:0,bottom:0,width:6,backgroundColor:'#FFE34F66'}]}/>)}
    {[10,35,60,85].map(top=><View key={`h${top}`} style={[s.stripe,{top:`${top}%`,left:0,right:0,height:5,backgroundColor:'#42D8CE88'}]}/>)}
    <Image source={logo} style={s.badge} resizeMode="contain" accessible={false}/>
  </View>;
}
export function BankBuildingMark() {
  return <View style={{width:'100%',height:35,alignItems:'center',justifyContent:'center'}}>
    <View style={{width:'90%',height:5,backgroundColor:'#6550AF',borderTopLeftRadius:10,borderTopRightRadius:10}}/>
    <View style={{width:'80%',height:25,backgroundColor:'#FFF1CC',borderWidth:1,borderColor:'#08796E',flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
      <View style={{width:4,height:19,backgroundColor:'#08796E'}}/><Image source={logo} style={{width:17,height:19}} resizeMode="contain" accessible={false}/><View style={{width:4,height:19,backgroundColor:'#08796E'}}/>
    </View><View style={{width:'90%',height:4,backgroundColor:'#6550AF'}}/>
  </View>;
}
// Compose existing canonical faces with code-drawn plaid; preserve original portraits.
export default function PlaidBankScene() {
  return <View style={s.scene} accessible accessibilityRole="image" accessibilityLabel="The Plaid Banking neighborhood bank. Annie watches over Bobbie, Westley, Tate and Chapo in PayPlace plaid uniforms.">
    <View style={s.tree}><CharacterArtwork source={{source:annie,width:864,height:1536,crop:[170,110,490,560]}} style={{width:'100%',height:'100%'}} resizeMode="cover"/></View>
    <View style={s.bank}>
      <View style={s.sign}><Image source={logo} style={{width:20,height:22}} resizeMode="contain" accessible={false}/><Text style={s.signText}>Plaid Banking</Text></View>
      <View style={s.staff}>{staff.map(person=><View key={person.name} style={s.person}>
        <CharacterArtwork source={{source:family,width:1402,height:1122,crop:person.crop}} style={s.face} resizeMode="cover"/>
        <PlaidUniform color={person.color}/>
        <Text style={s.name}>{person.name}</Text>
      </View>)}</View>
      <View style={s.counter}><Text style={s.counterText}>Money without shame.</Text></View>
    </View>
  </View>;
}
const s=StyleSheet.create({
  scene:{height:170,width:'100%',backgroundColor:'#D9F2DA',borderRadius:18,overflow:'hidden',flexDirection:'row',padding:9,gap:7},
  tree:{width:'20%',height:'100%',borderRadius:30,overflow:'hidden',borderWidth:2,borderColor:'#8A754C'},
  bank:{flex:1,minWidth:0,backgroundColor:'#FFF8E8',borderRadius:12,borderWidth:2,borderColor:'#B89769',overflow:'hidden'},
  sign:{backgroundColor:'#6550AF',padding:5,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},signText:{color:'#FFF',fontSize:15,fontWeight:'900'},
  staff:{flex:1,flexDirection:'row',paddingHorizontal:4,gap:3,alignItems:'flex-end'},person:{flex:1,minWidth:0,alignItems:'center'},face:{width:'100%',height:52,borderRadius:20,overflow:'hidden'},
  uniform:{width:'85%',height:35,borderTopLeftRadius:12,borderTopRightRadius:12,overflow:'hidden',marginTop:-2,alignItems:'center'},stripe:{position:'absolute'},badge:{width:16,height:18,marginTop:5,borderRadius:3},name:{fontSize:9,lineHeight:13,fontWeight:'800',color:'#34465E'},
  counter:{padding:4,backgroundColor:'#A37956'},counterText:{color:'#FFF',fontSize:11,fontWeight:'800',textAlign:'center'},
});
