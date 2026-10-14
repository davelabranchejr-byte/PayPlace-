import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Privacy';
import Alert from './alert';
export const PRIVACY_URL = 'https://payplace-dave.davelabranchejr.chatgpt.site/privacy';
export const SUPPORT_URL = 'https://payplace-dave.davelabranchejr.chatgpt.site/support';
export default function PrivacyLinks() {
  const open = url => Linking.openURL(url).catch(() => Alert.alert('Could not open this page', 'Please try again when you have an internet connection.'));
  return <View style={s.row}>
    <TouchableOpacity accessibilityRole="link" accessibilityLabel="Privacy Policy" onPress={() => open(PRIVACY_URL)} style={s.link}><Text style={s.text}>Privacy Policy</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="link" accessibilityLabel="Help & Support" onPress={() => open(SUPPORT_URL)} style={s.link}><Text style={s.text}>Help & Support</Text></TouchableOpacity>
  </View>;
}
const s = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 }, link: { minHeight: 44, justifyContent: 'center' }, text: { color: '#6754C5', fontSize: 15, fontWeight: '800' } });
