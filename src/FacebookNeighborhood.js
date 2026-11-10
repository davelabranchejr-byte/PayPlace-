import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Privacy';
import Alert from './alert';
import FittedArtwork from './FittedArtwork';

export const FACEBOOK_NEIGHBORHOOD_URL = 'https://www.facebook.com/share/1FRdYmPwum/?mibextid=wwXIfr';
export default function FacebookNeighborhood() {
  async function open() {
    try { await Linking.openURL(FACEBOOK_NEIGHBORHOOD_URL); }
    catch { Alert.alert('The neighborhood is still here', 'Facebook could not open just now. Please try again in a moment.'); }
  }
  return <TouchableOpacity artworkMode="integrated" accessibilityRole="link" accessibilityLabel="Move into the neighborhood on Facebook"
    accessibilityHint="Opens the PayPlace Facebook community outside the app" onPress={open} style={s.card}>
    <FittedArtwork source={require('../assets/characters/facebook-moving-day.jpg')} aspectRatio={3 / 2} accessible={false} />
    <View style={s.button}>
    <View style={s.icon}><Ionicons name="logo-facebook" size={30} color="#FFFFFF" /></View>
    <View style={s.copy}><Text style={s.title}>Move into the neighborhood on Facebook</Text><Text style={s.body}>Meet your neighbors. Help shape PayPlace.</Text></View>
    <Ionicons name="open-outline" size={22} color="#132547" />
    </View>
  </TouchableOpacity>;
}
const s = StyleSheet.create({
  card: { backgroundColor: '#18D3C3', borderRadius: 22, borderWidth: 2, borderColor: '#078D86', overflow: 'hidden', marginVertical: 8 },
  button: { minHeight: 64, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#7842D2', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 }, title: { color: '#132547', fontSize: 17, lineHeight: 23, fontWeight: '900' }, body: { color: '#163C49', fontSize: 14, lineHeight: 21, marginTop: 5 },
});
