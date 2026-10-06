import React, { useState } from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { reminderSettings } from './bill-reminders.mjs';
import { requestBillReminderPermission } from './useBillReminders';

export default function BillReminderSettings({ settings, onChange, status, styles: s }) {
  const options = reminderSettings(settings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function toggle() {
    setBusy(true); setMessage('');
    try {
      if (!options.enabled && !(await requestBillReminderPermission())) { setMessage('Allow notifications in your phone’s PayPlace settings, then enable reminders here.'); return; }
      onChange({ ...options, enabled: !options.enabled });
    } catch { setMessage('Could not update reminders. Try again.'); }
    finally { setBusy(false); }
  }
  return <View style={s.card}>
    <Text style={s.heading}>Annie’s discreet bill reminders</Text>
    <Text style={s.body}>A quiet note to visit PayPlace. Bill names, amounts, and account details stay out of notifications. Reminders are free and optional.</Text>
    {!status.supported ? <Text style={s.body}>Available in the iPhone and Android apps.</Text> : <>
      <Text style={s.body}>Use a full due date (YYYY-MM-DD) for each unpaid bill. Annie sends a quiet note {options.daysBefore} {options.daysBefore === 1 ? 'day' : 'days'} before it is due and on the due date, with at most one note per day. Past reminder times are skipped.</Text>
      <TouchableOpacity accessibilityRole="button" style={s.button} disabled={busy} onPress={toggle}><Text style={s.buttonText}>{busy ? 'Checking…' : options.enabled ? 'Turn off reminders' : 'Enable Annie’s reminders'}</Text></TouchableOpacity>
      {options.enabled && <>
        <Text style={s.label}>Reminder time • your phone’s local time</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>{[[9, '9 AM'], [18, '6 PM']].map(([hour, label]) => <TouchableOpacity key={hour} accessibilityRole="radio" accessibilityState={{ selected: options.hour === hour }} style={[s.outline, { flex: 1, backgroundColor: options.hour === hour ? '#EEE9FF' : 'white' }]} onPress={() => onChange({ ...options, hour })}><Text style={s.link}>{label}</Text></TouchableOpacity>)}</View>
        <Text style={s.label}>Remind me before the due date</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>{[1, 3].map(daysBefore => <TouchableOpacity key={daysBefore} accessibilityRole="radio" accessibilityState={{ selected: options.daysBefore === daysBefore }} style={[s.outline, { flex: 1, backgroundColor: options.daysBefore === daysBefore ? '#EEE9FF' : 'white' }]} onPress={() => onChange({ ...options, daysBefore })}><Text style={s.link}>{daysBefore} {daysBefore === 1 ? 'day' : 'days'}</Text></TouchableOpacity>)}</View>
        <Text style={s.body}>{status.error ? 'Could not update the schedule. Reopen PayPlace to try again.' : status.permissionBlocked ? 'Notifications are blocked in your phone’s settings.' : `${status.count} upcoming reminder ${status.count === 1 ? 'day' : 'days'} scheduled.`}</Text>
        {!!status.needsDate && <Text style={s.body}>{status.needsDate} unpaid {status.needsDate === 1 ? 'bill needs' : 'bills need'} a full date before Annie can remind you.</Text>}
        {status.permissionBlocked && <TouchableOpacity accessibilityRole="button" style={s.outline} onPress={() => Linking.openSettings()}><Text style={s.link}>Open phone settings</Text></TouchableOpacity>}
      </>}
      <Text style={s.body}>Annie schedules the next 48 reminder days. Paid or deleted bills leave the schedule. Reopen PayPlace after changing your phone’s time zone. Phone settings can delay delivery; keep checking your bill dates.</Text>
    </>}
    {!!message && <Text accessibilityLiveRegion="polite" style={s.body}>{message}</Text>}
  </View>;
}
