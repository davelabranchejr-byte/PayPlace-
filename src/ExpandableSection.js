import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Privacy';

export default function ExpandableSection({ title, children }) {
  const [expanded, setExpanded] = useState(false);
  return <View style={s.section}>
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }}
      accessibilityLabel={title} onPress={() => setExpanded(value => !value)} style={s.toggle}>
      <Text style={s.title}>{title}</Text><Text accessible={false} style={s.mark}>{expanded ? '−' : '+'}</Text>
    </TouchableOpacity>
    {expanded && <View style={s.content}>{children}</View>}
  </View>;
}

const s = StyleSheet.create({
  section: { marginBottom: 12, borderRadius: 18, borderWidth: 1, borderColor: '#D4C9ED', backgroundColor: '#FFFDF8' },
  toggle: { minHeight: 52, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: '#173C50' },
  mark: { fontSize: 24, color: '#6550AF' }, content: { padding: 10 },
});
