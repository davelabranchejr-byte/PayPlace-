import React, { useContext, useMemo, useRef, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { PrivacyContext, Text, TextInput } from './Privacy';
import { calendarHtml, calendarKinds, calendarTitle, calendarWeekdays, eventText, illustratedCalendarWeeks, paymentCalendar } from './monthly-payment-calendar.mjs';
import { printCalendar } from './monthly-calendar-print';
import art from './calendar-artwork';
import { dateKey, readDate } from './paycheck-calendar.mjs';
import { saveGroomingAppointment } from './grooming-appointments.mjs';
import Alert from './alert';

function Button({ title, onPress, disabled, selected }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled, selected }} disabled={disabled}
    onPress={onPress} style={[s.button, selected && s.selected]}>
    <Text style={s.label}>{title}</Text>
  </Pressable>;
}

function newAppointment(date) {
  return { pet: '', date: dateKey(date), time: '', draftId: `grooming-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
}

export default function MonthlyPaymentCalendar({ finance, onClose, sample, canPrint = true, onAppointmentsChange, startGrooming = false }) {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1, 12);
  });
  const [landscape, setLandscape] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState(() => startGrooming ? newAppointment(new Date()) : null);
  const [appointmentError, setAppointmentError] = useState('');
  const scroll = useRef(null);
  const { hideAmounts } = useContext(PrivacyContext);
  const events = useMemo(() => paymentCalendar(finance, month), [finance, month]);
  const weeks = useMemo(() => illustratedCalendarWeeks(month, events), [month, events]);
  const appointments = finance.groomingAppointments || [];
  const change = delta => setMonth(current => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12));

  function openAppointment(entry) {
    setAppointmentError('');
    setAppointment(entry || newAppointment(month));
    scroll.current?.scrollTo?.({ y: 0, animated: true });
  }

  function saveAppointment() {
    try {
      onAppointmentsChange(saveGroomingAppointment(appointments, appointment, appointment.draftId));
      const date = readDate(appointment.date.trim());
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1, 12));
      setAppointment(null);
    } catch (err) {
      setAppointmentError(err.message);
    }
  }

  async function print() {
    setBusy(true);
    setError('');
    try {
      const sources = Object.fromEntries(weeks.flat().flatMap(({ illustrations }) =>
        illustrations.map(({ key }) => [key, art[key]])));
      await printCalendar(images => calendarHtml(month, events, hideAmounts, images, landscape, sample), sources, landscape);
    } catch {
      setError('Couldn’t open printing. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <Modal visible onRequestClose={onClose} animationType="slide">
    <SafeAreaView style={s.page}>
      <ScrollView ref={scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Button title="Close monthly calendar" onPress={onClose} />
        <Text accessibilityRole="header" style={s.title}>Monthly payment calendar</Text>
        {sample && <Text>Sample calendar · fictional data</Text>}
        <View style={s.controls}>
          <Button title="Previous month" onPress={() => change(-1)} />
          <Button title="Next month" onPress={() => change(1)} />
          {onAppointmentsChange && !appointment && <Button title="Add grooming appointment" onPress={() => openAppointment()} />}
        </View>
        {appointment && <View style={s.form}>
          <Text accessibilityRole="header" style={s.label}>{appointment.id ? 'Edit grooming appointment' : 'Add grooming appointment'}</Text>
          <Text style={s.hint}>Add an appointment you’ve arranged with your groomer.</Text>
          {[
            ['pet', 'Pet name', 80], ['date', 'Date (YYYY-MM-DD)', 10], ['time', 'Time (HH:MM, optional)', 5],
          ].map(([field, label, length]) => <View key={field}>
            <Text style={s.label}>{label}</Text>
            <TextInput accessibilityLabel={label} value={appointment[field]} maxLength={length} style={s.input}
              onChangeText={value => setAppointment(current => ({ ...current, [field]: value }))} />
          </View>)}
          {!!appointmentError && <Text accessibilityRole="alert">{appointmentError}</Text>}
          <View style={s.controls}>
            <Button title="Save appointment" onPress={saveAppointment} />
            <Button title="Cancel appointment edit" onPress={() => setAppointment(null)} />
            {appointment.id && <Button title="Remove appointment" onPress={() => Alert.alert('Remove this appointment?', 'This removes the entry from PayPlace.', [
              { text: 'Keep appointment', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: () => {
                onAppointmentsChange(appointments.filter(item => item.id !== appointment.id));
                setAppointment(null);
              } },
            ])} />}
          </View>
        </View>}
        <Text accessibilityRole="header" style={s.title}>{calendarTitle(month)}</Text>
        <View style={s.controls}>{Object.entries(calendarKinds).map(([id, kind]) =>
          <View key={id} style={[s.legend, { backgroundColor: kind.color }]}>
            <Text style={s.label}>{kind.label}</Text>
          </View>)}</View>
        <View style={s.row}>{calendarWeekdays.map(day => <Text key={day} style={s.weekday} numberOfLines={1} adjustsFontSizeToFit>{day}</Text>)}</View>
        {weeks.map((week, i) => <View key={i} style={s.row}>{week.map(({ day, items, illustrations }, j) => {
          const labels = illustrations.map(({ kind }) => calendarKinds[kind].label);
          return <View key={j} accessible={!!day} accessibilityLabel={day ? [String(day), ...labels].join(', ') : undefined}
            style={[s.cell, items.length > 0 && { backgroundColor: calendarKinds[items[0].kind].color }]}>
            {!!day && <Text style={s.label}>{day}</Text>}
            {illustrations.length > 0 && <View style={s.cellArt}>
              {illustrations.map(({ key }) => <Image key={key} source={art[key]} resizeMode="contain" accessible={false}
                style={[s.sticker, { width: illustrations.length === 1 ? '100%' : '48%' }]} />)}
            </View>}
          </View>;
        })}</View>)}
        {canPrint && <View style={s.controls}>
          <Button title="Portrait" selected={!landscape} onPress={() => setLandscape(false)} />
          <Button title="Landscape" selected={landscape} onPress={() => setLandscape(true)} />
          <Button title={busy ? 'Opening print…' : 'Print monthly calendar'} disabled={busy} onPress={print} />
        </View>}
        {!!error && <Text accessibilityRole="alert">{error}</Text>}
        <Text>Paydays and projected renewals are estimates. Recorded payments appear on the date logged in PayPlace.</Text>
        {!events.length && <Text>No dated entries for this month.</Text>}
        {events.map((event, i) => <View key={i} style={[s.event, { backgroundColor: calendarKinds[event.kind].color }]}>
          <Text style={s.label}>{Number(event.date.slice(-2))} · {calendarKinds[event.kind].label} · {eventText(event, hideAmounts)}</Text>
          {event.appointmentId && onAppointmentsChange && <Button title={`Edit grooming appointment on ${event.date}`} onPress={() =>
            openAppointment(appointments.find(item => item.id === event.appointmentId))} />}
        </View>)}
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAF5FF' },
  content: { padding: 10, paddingBottom: 48, gap: 9 },
  title: { fontSize: 24, fontWeight: '900', color: '#172649' },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, paddingVertical: 4, textAlign: 'center', color: '#172649', fontWeight: '800' },
  cell: { flex: 1, minWidth: 0, padding: 2, borderWidth: 0.5, borderColor: '#CBBBE5', backgroundColor: '#FFF', minHeight: 72 },
  cellArt: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 1 },
  sticker: { aspectRatio: 1, maxHeight: 48 },
  label: { color: '#182751', fontWeight: '800' },
  button: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#E7CCFF' },
  selected: { borderWidth: 2, borderColor: '#6833A5' },
  legend: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  event: { borderRadius: 12, padding: 8, gap: 6 },
  form: { backgroundColor: '#FFDCE9', padding: 12, borderRadius: 14, gap: 8 },
  hint: { color: '#354464' },
  input: { minHeight: 44, padding: 8, borderRadius: 8, marginTop: 3, backgroundColor: '#FFF', color: '#182751' },
});
