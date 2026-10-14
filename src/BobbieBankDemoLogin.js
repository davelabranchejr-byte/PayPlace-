import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from './Privacy';

// Public demo credentials only. This never authenticates a person or calls Plaid.
export default function BobbieBankDemoLogin({ onConnect }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  function connect() {
    const matches = username.trim().toLowerCase() === 'bobbie' && password === 'litterbox';
    setPassword('');
    if (!matches) { setError('Try username Bobbie and password litterbox. These are public demo credentials.'); return; }
    setError('');
    onConnect();
  }
  return <View style={s.box}>
    <Text accessibilityRole="header" style={s.title}>Bobbie’s demo bank</Text>
    <Text style={s.body}>Try our banking-feature previews with fictional accounts and money. This demo does not connect to Plaid or a real bank.</Text>
    <Text style={s.body}>Username: Bobbie · Password: litterbox</Text>
    <Text style={s.label}>Demo username</Text>
    <TextInput accessibilityLabel="Demo username" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} style={s.input}/>
    <Text style={s.label}>Demo password</Text>
    <TextInput accessibilityLabel="Demo password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} style={s.input} onSubmitEditing={connect}/>
    {!!error && <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open Bobbie’s banking demo" onPress={connect} style={s.button}><Text style={s.buttonText}>Open Bobbie’s banking demo</Text></TouchableOpacity>
    <Text style={s.body}>Explore round-ups, payday savings, Money Watch, recovery plans and a fictional credit score. No real transfers, bill payments or credit checks happen.</Text>
  </View>;
}
const s = StyleSheet.create({
  box:{width:'100%',maxWidth:600,minWidth:0,alignSelf:'center',padding:18,borderRadius:22,backgroundColor:'#FFF8EE'},
  title:{fontSize:25,fontWeight:'900',color:'#173C50',marginBottom:12},
  body:{fontSize:16,lineHeight:24,color:'#475569',marginBottom:12},
  label:{fontSize:16,fontWeight:'800',color:'#173C50',marginBottom:6},
  input:{width:'100%',minWidth:0,borderWidth:1,borderColor:'#C4B5FD',borderRadius:12,padding:14,fontSize:17,backgroundColor:'#FFFFFF',color:'#173C50',marginBottom:14},
  error:{fontSize:16,lineHeight:23,color:'#9E1F63',marginBottom:12},
  button:{padding:16,borderRadius:15,backgroundColor:'#6754E8',marginBottom:14},
  buttonText:{fontSize:17,lineHeight:24,fontWeight:'900',color:'#FFFFFF',textAlign:'center'},
});
