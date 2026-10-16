import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from './Privacy';

export default function EntrySheet({ visible, title, onClose, children }) {
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6FBFF' }}>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text accessibilityRole="header" style={{ flex: 1, fontSize: 20, fontWeight: '800', color: '#173C50' }}>{title}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Close ${title.toLowerCase()}`} onPress={onClose}
          style={{ minHeight: 48, minWidth: 64, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#6550AF', fontWeight: '800' }}>Close</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {visible ? children : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}
