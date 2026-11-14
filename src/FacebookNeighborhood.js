import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Privacy';
import Alert from './alert';
import FittedArtwork from './FittedArtwork';

export const FACEBOOK_NEIGHBORHOOD_URL = 'https://www.facebook.com/share/1FRdYmPwum/?mibextid=wwXIfr';
const label = 'Join the Neighborhood on Facebook';
export default function FacebookNeighborhood() {
  async function open() {
    try { await Linking.openURL(FACEBOOK_NEIGHBORHOOD_URL); }
    catch { Alert.alert('The neighborhood is still here', 'Facebook could not open just now. Please try again in a moment.'); }
  }
  return <TouchableOpacity artworkMode="integrated" accessibilityRole="link" accessibilityLabel={label}
    accessibilityHint="Opens the PayPlace Facebook community outside the app" onPress={open} style={s.card}>
    <FittedArtwork source={require('../assets/characters/facebook-moving-day.jpg')} aspectRatio={3 / 2} resizeMode="cover" accessible={false} />
    <View style={s.copy}>
      <Text style={s.title}>{label}</Text>
      <Ionicons name="open-outline" size={20} color="#132547" accessible={false} />
    </View>
  </TouchableOpacity>;
}
const s = StyleSheet.create({
  card: { minHeight: 96, overflow: 'hidden', backgroundColor: '#18D3C3', borderRadius: 22, borderWidth: 2, borderColor: '#078D86', marginTop: 4 },
  copy: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12 },
  title: { flex: 1, color: '#132547', fontSize: 18, fontWeight: '900' },
});
