import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, View } from 'react-native';
import IllustratedButton from './IllustratedButton';
import { Text } from './Privacy';

const closeArtwork = {
  bill: require('../assets/actions/close-add-bill.jpg'),
  scan: require('../assets/actions/close-scan.jpg'),
  import: require('../assets/actions/close-import.jpg'),
  batch: require('../assets/actions/close-batch.jpg'),
  compare: require('../assets/actions/close-compare.jpg'),
  recurring: require('../assets/actions/close-recurring.jpg'),
  breakdown: require('../assets/actions/close-breakdown.jpg'),
  household: require('../assets/actions/close-household.jpg'),
  debt: require('../assets/actions/close-add-debt.jpg'),
  outlook: require('../assets/actions/close-outlook.jpg'),
};

export default function EntrySheet({ visible, title, closeScene, onClose, children }) {
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6FBFF' }}>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text accessibilityRole="header" style={{ flex: 1, fontSize: 20, fontWeight: '800', color: '#173C50' }}>{title}</Text>
        <IllustratedButton compact artwork={closeArtwork[closeScene] || closeArtwork.bill} label="Close"
          accessibilityLabel={`Close ${title.toLowerCase()}`} onPress={onClose} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {visible ? children : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}
