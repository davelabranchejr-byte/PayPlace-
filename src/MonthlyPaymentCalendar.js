import React, { useContext, useMemo, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { PrivacyContext, Text } from './Privacy';
import { calendarHtml, calendarKinds, calendarTitle, calendarWeekdays, calendarWeeks, eventText, paymentCalendar } from './monthly-payment-calendar.mjs';
import { printCalendar } from './monthly-calendar-print';

const art = {
  due: require('../assets/characters/billiam-canonical.png'),
  paid: require('../assets/characters/feature-review-bills-westley.png'),
  pay: require('../assets/characters/extra-paycheck-chapo-treat-rain.png'),
  subscription: require('../assets/characters/onboarding-bank-linking-bobbie.png'),
};

function Button({ title, onPress, disabled, selected }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled, selected }} disabled={disabled}
    onPress={onPress} style={[s.button, selected && s.selected]}>
    <Text style={s.label}>{title}</Text>
  </Pressable>;
}

export default function MonthlyPaymentCalendar({ finance, onClose, sample }) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1, 12);
  });
  const [landscape, setLandscape] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { hideAmounts } = useContext(PrivacyContext);
  const events = useMemo(() => paymentCalendar(finance, month), [finance, month]);
  const change = delta => setMonth(current => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12));

  async function print() {
    setBusy(true);
    setError('');
    try {
      await printCalendar(images => calendarHtml(month, events, hideAmounts, images, landscape, sample), art, landscape);
    } catch {
      setError('Couldn’t open printing. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <Modal visible onRequestClose={onClose} animationType="slide">
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.content}>
        <Button title="Close monthly calendar" onPress={onClose} />
        <Text accessibilityRole="header" style={s.title}>Monthly payment calendar</Text>
        {sample && <Text>Sample calendar · fictional data</Text>}
        <View style={s.controls}>
          <Button title="Previous month" onPress={() => change(-1)} />
          <Button title="Next month" onPress={() => change(1)} />
        </View>
        <Text accessibilityRole="header" style={s.title}>{calendarTitle(month)}</Text>
        <View style={s.controls}>{Object.entries(calendarKinds).map(([id, kind]) =>
          <View key={id} style={[s.legend, { backgroundColor: kind.color }]}>
            <Image source={art[id]} resizeMode="contain" style={s.art} accessible={false} />
            <Text style={s.label}>{kind.mascot}{'\n'}{kind.label}</Text>
          </View>)}</View>
        <View style={s.row}>{calendarWeekdays.map(day => <Text key={day} style={s.cell}>{day}</Text>)}</View>
        {calendarWeeks(month).map((week, i) => <View key={i} style={s.row}>{week.map((day, j) => {
          const items = day ? events.filter(event => Number(event.date.slice(-2)) === day) : [];
          return <View key={j} style={[s.cell, items.length > 0 && { backgroundColor: calendarKinds[items[0].kind].color }]}>
            <Text style={s.label}>{day || ''}</Text>
            {items.length > 0 && <Text>{items.length} {items.length === 1 ? 'item' : 'items'}</Text>}
          </View>;
        })}</View>)}
        <View style={s.controls}>
          <Button title="Portrait" selected={!landscape} onPress={() => setLandscape(false)} />
          <Button title="Landscape" selected={landscape} onPress={() => setLandscape(true)} />
          <Button title={busy ? 'Opening print…' : 'Print monthly calendar'} disabled={busy} onPress={print} />
        </View>
        {!!error && <Text accessibilityRole="alert">{error}</Text>}
        <Text>Paydays and projected renewals are estimates. Recorded payments appear on the date logged in PayPlace.</Text>
        {!events.length && <Text>No dated entries for this month.</Text>}
        {events.map((event, i) => <View key={i} style={[s.legend, { backgroundColor: calendarKinds[event.kind].color }]}>
          <Text style={s.label}>{Number(event.date.slice(-2))} · {calendarKinds[event.kind].label} · {eventText(event, hideAmounts)}</Text>
        </View>)}
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAF5FF' },
  content: { padding: 16, paddingBottom: 48, gap: 9 },
  title: { fontSize: 24, fontWeight: '900', color: '#172649' },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row' },
  cell: { flex: 1, padding: 3, borderWidth: 0.5, borderColor: '#CBBBE5', backgroundColor: '#FFF', minHeight: 32 },
  label: { color: '#182751', fontWeight: '800' },
  button: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#E7CCFF' },
  selected: { borderWidth: 2, borderColor: '#6833A5' },
  legend: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 8, gap: 6 },
  art: { width: 42, height: 42 },
});
