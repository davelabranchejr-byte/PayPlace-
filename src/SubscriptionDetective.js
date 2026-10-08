import React, { useMemo, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Linking, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CharacterArtwork from './CharacterArtwork';
import Alert from './alert';
import { CASE_STATES, FREQUENCIES, caseSummary, subscriptionCases } from './subscription-detective.mjs';
import { parseAmount } from './smart-mirror.mjs';
import { requestBillReminderPermission } from './useBillReminders';

const artwork = require('../assets/characters/bobbie-premium-clubhouse.png');
const money = amount => `$${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const newCase = () => ({ id: `subscription-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: '', amount: '', frequency: 'Monthly', renewalDate: '', trialEnds: '', manageUrl: '', billId: '', status: 'Keep' });
function Art() {
  const size = Image.resolveAssetSource(artwork);
  return <View style={[s.artFrame, { aspectRatio: size.width / size.height }]}><CharacterArtwork source={artwork} style={s.art} resizeMode="contain" accessibilityLabel="Bobbie smiles in the teal, purple, yellow and coral gown she designed, wearing a jeweled tiara in the Detective Clubhouse. Oooh, premium like me!" /></View>;
}
function Button({ label, onPress, secondary = false, disabled = false }) {
  return <TouchableOpacity accessibilityRole="button" disabled={disabled} accessibilityLabel={label} onPress={onPress} style={[s.button, secondary && s.secondary, disabled && { opacity: 0.5 }]}><Text style={[s.buttonText, secondary && { color: '#30204F' }]}>{label}</Text></TouchableOpacity>;
}
function Field({ label, value, onChangeText, currency = false, ...props }) {
  return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput {...props} accessibilityLabel={label} style={s.input} value={String(value || '')} onChangeText={onChangeText} keyboardType={currency ? 'decimal-pad' : props.keyboardType || 'default'} onBlur={currency ? () => { const amount = parseAmount(value); if (amount !== null) onChangeText(amount.toFixed(2)); } : undefined} /></View>;
}
function Choices({ label, options, value, onChange }) {
  return <View style={s.field}><Text style={s.label}>{label}</Text><View style={s.choices}>{options.map(option => <TouchableOpacity key={option} accessibilityRole="radio" accessibilityLabel={`${label}: ${option}`} accessibilityState={{ selected: value === option }} onPress={() => onChange(option)} style={[s.choice, value === option && s.selected]}><Text style={[s.choiceText, value === option && { color: '#FFFFFF' }]}>{option}</Text></TouchableOpacity>)}</View></View>;
}

export function SubscriptionDetectiveEntry({ onOpen }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open Subscription Detective, Premium feature included during beta" activeOpacity={0.92} onPress={onOpen} style={s.entry}>
    <Art /><View style={s.entryCopy}><Text style={s.eyebrow}>PREMIUM PAID FEATURE</Text><Text style={s.title}>Subscription Detective</Text><Text style={s.quote}>“Oooh, premium like me!” — Bobbie</Text><Text style={s.body}>Investigate subscriptions, keep an eye on trials, and give every renewal a little attention.</Text><View style={s.entryAction}><Ionicons name="search" color="#FFFFFF" size={20} /><Text style={s.buttonText}>Enter the Detective Clubhouse</Text></View><Text style={s.note}>Included during beta · no purchase or charge</Text></View>
  </TouchableOpacity>;
}

export default function SubscriptionDetective({ visible, onClose, finance, onAction, onBills, reminderStatus, onRemindersChange }) {
  const [draft, setDraft] = useState(null);
  const [filter, setFilter] = useState('Active');
  const [message, setMessage] = useState('');
  const [permissionBusy, setPermissionBusy] = useState(false);
  const scroll = useRef(null);
  const formY = useRef(0);
  const summary = useMemo(() => caseSummary(finance), [finance, visible]);
  const cases = subscriptionCases(finance);
  const displayed = cases.filter(item => filter === 'All' || (filter === 'Cancelled' ? item.status === 'Cancelled' : item.status !== 'Cancelled'));
  function edit(item) {
    setDraft({ ...item, amount: String(item.amount), billId: (finance.bills || []).some(bill => bill.id === item.billId) ? item.billId : '' });
    setMessage(''); scroll.current?.scrollTo({ y: formY.current, animated: true });
  }
  function change(field, value) { setDraft(current => ({ ...current, [field]: value })); setMessage(''); }
  function save() { if (onAction({ type: 'save', entry: draft })) { setDraft(null); setMessage('Case saved in your Clubhouse.'); } }
  function close() { setDraft(null); setMessage(''); onClose(); }
  function status(item, next) {
    const apply = () => { if (onAction({ type: 'status', id: item.id, status: next })) setMessage(next === 'Cancelled' ? 'Marked cancelled. Your provider still needs to confirm cancellation.' : `Case marked ${next.toLowerCase()}.`); };
    if (next === 'Cancelled') Alert.alert('Have you cancelled with the provider?', 'Mark this case cancelled after cancelling through the provider or app store. PayPlace cannot stop the charge for you.', [{ text: 'Go back', style: 'cancel' }, { text: 'I cancelled it', onPress: apply }]);
    else apply();
  }
  async function reminders() {
    setPermissionBusy(true); setMessage('');
    try {
      const enabled = finance.subscriptionReminders?.enabled === true;
      if (!enabled && !(await requestBillReminderPermission())) { setMessage('Allow notifications in your phone’s PayPlace settings, then enable reminders here.'); return; }
      onRemindersChange({ enabled: !enabled });
    } catch { setMessage('Could not change reminders. Please try again.'); }
    finally { setPermissionBusy(false); }
  }
  return <Modal visible={visible} animationType="slide" onRequestClose={close}>
    <SafeAreaView style={s.safe}><KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}><View style={s.flex}><Text style={s.eyebrow}>PAYPLACE PREMIUM · INCLUDED DURING BETA</Text><Text accessibilityRole="header" style={s.title}>Detective Clubhouse</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Close Detective Clubhouse" onPress={close} style={s.close}><Ionicons name="close" size={26} color="#142445" /></TouchableOpacity></View>
      <ScrollView ref={scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Art /><Text style={s.quote}>“Oooh, premium like me!” — Bobbie</Text>
        <Text style={s.body}>Little charges deserve a little investigation. Add your subscriptions and trials, then decide what earns a place in your life.</Text>
        <Text style={s.note}>Premium paid feature. Available without charge during beta; purchases and automatic bank detection are not active.</Text>
        <View style={s.stats}><View style={[s.stat, { backgroundColor: '#FFD85A' }]}><Text style={s.label}>Monthly equivalent</Text><Text style={s.value}>{money(summary.monthly)}</Text></View><View style={[s.stat, { backgroundColor: '#65F4D2' }]}><Text style={s.label}>Yearly estimate</Text><Text style={s.value}>{money(summary.annual)}</Text></View></View>
        <Text style={s.note}>Estimates at the prices you entered, including the price after free trials. Weekly plans use 52 payments/year. These totals do not change your balance or Safe to Spend.</Text>
        <Button label={draft ? 'Close subscription form' : 'Add a subscription or trial'} onPress={() => { setDraft(draft ? null : newCase()); setMessage(''); }} />
        {draft && <View style={[s.card, { backgroundColor: '#D9F6FF' }]} onLayout={({ nativeEvent }) => { formY.current = nativeEvent.layout.y; scroll.current?.scrollTo({ y: formY.current, animated: true }); }}>
          <Text accessibilityRole="header" style={s.subtitle}>{cases.some(item => item.id === draft.id) ? 'Edit this case' : 'Open a new case'}</Text>
          <Field label="Subscription name" value={draft.name} onChangeText={value => change('name', value)} maxLength={80} placeholder="Streaming, gym, or an app…" />
          <Field label="Recurring price (after trial, if any)" value={draft.amount} onChangeText={value => change('amount', value)} currency />
          <Choices label="Billing frequency" options={Object.keys(FREQUENCIES)} value={draft.frequency} onChange={value => change('frequency', value)} />
          <Field label="Next renewal (YYYY-MM-DD)" value={draft.renewalDate} onChangeText={value => change('renewalDate', value)} placeholder="2026-11-08" autoCapitalize="none" />
          <Field label="Trial ends (optional, YYYY-MM-DD)" value={draft.trialEnds} onChangeText={value => change('trialEnds', value)} autoCapitalize="none" />
          <Field label="Provider settings link (optional, https://)" value={draft.manageUrl} onChangeText={value => change('manageUrl', value)} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
          <Choices label="Case decision" options={CASE_STATES.filter(value => value !== 'Cancelled' || draft.status === 'Cancelled')} value={draft.status} onChange={value => change('status', value)} />
          <Text style={s.label}>Link an existing bill (optional)</Text><Text style={s.note}>Linking is a reference only. Keep the amount and due date current in Bills; no extra bill or budget deduction is created.</Text>
          <Button secondary label="No linked bill" onPress={() => change('billId', '')} />
          {(finance.bills || []).map(bill => <TouchableOpacity key={bill.id} accessibilityRole="radio" accessibilityLabel={`Link ${bill.name}`} accessibilityState={{ selected: draft.billId === bill.id }} style={[s.billChoice, draft.billId === bill.id && { borderColor: '#5935B5', borderWidth: 2 }]} onPress={() => change('billId', bill.id)}><Text style={s.body}>{draft.billId === bill.id ? '✓ ' : ''}{bill.name} · {money(bill.amount)}</Text></TouchableOpacity>)}
          <Button label="Save this case" onPress={save} /><Button label="Cancel editing" secondary onPress={() => setDraft(null)} />
        </View>}
        {!!message && <Text accessibilityLiveRegion="polite" style={s.notice}>{message}</Text>}
        <View style={[s.card, { backgroundColor: '#FFD6CF' }]}><Text accessibilityRole="header" style={s.subtitle}>Dates on the caseboard</Text>
          {!summary.due.length && <Text style={s.body}>Your board is clear. Add a subscription or trial to pin its next date here.</Text>}
          {summary.due.map(item => <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Edit ${item.name}, ${item.trial ? 'trial ends' : 'renewal'} ${item.eventDate}`} key={item.id} style={s.dateRow} onPress={() => edit(item)}><Text style={s.label}>{item.name}</Text><Text style={s.body}>{item.trial ? 'Trial ends' : 'Renewal'} · {item.eventDate}{item.overdue ? ' · Date passed; review this case' : ''}</Text></TouchableOpacity>)}
        </View>
        <View style={[s.card, { backgroundColor: '#DDD0FF' }]}><Text accessibilityRole="header" style={s.subtitle}>Your subscription cases</Text><Choices label="Show cases" options={['Active', 'Cancelled', 'All']} value={filter} onChange={setFilter} />
          <Text style={s.note}>{summary.active.length} active · {summary.reviewCount} to review</Text>
          {!displayed.length && <Text style={s.body}>No cases in this view yet.</Text>}
          {displayed.map(item => <View key={item.id} style={s.case}>
            <Text accessibilityRole="header" style={s.subtitle}>{item.name}</Text><Text style={s.body}>{money(item.amount)} · {item.frequency} · {item.status}</Text><Text style={s.note}>Renewal: {item.renewalDate}{item.trialEnds ? ` · Trial ends: ${item.trialEnds}` : ''}</Text>
            {!!item.billId && <Text style={s.note}>Linked bill: {(finance.bills || []).find(bill => bill.id === item.billId)?.name || 'removed — edit to unlink'}.</Text>}
            <Button secondary label={`Edit ${item.name}`} onPress={() => edit(item)} />
            <View style={s.choices}>{CASE_STATES.filter(next => next !== item.status).map(next => <Button secondary key={next} label={next === 'Cancelled' ? 'Mark cancelled' : next === 'Keep' ? 'Keep it' : 'Review it'} onPress={() => status(item, next)} />)}</View>
            {item.status !== 'Cancelled' && <Button secondary label="Move renewal forward one cycle" onPress={() => { if (onAction({ type: 'renew', id: item.id })) setMessage('Renewal date advanced. This records a date; it does not make a payment.'); }} />}
            {!!item.manageUrl && <Button secondary label="Open provider settings" onPress={() => Linking.openURL(item.manageUrl).catch(() => setMessage('Could not open that link. Check the provider address in this case.'))} />}
            <Button secondary label={`Remove ${item.name} from Clubhouse`} onPress={() => Alert.alert('Remove this case?', 'This deletes the tracking entry. Your subscription and any linked bill stay with their provider and in Bills.', [{ text: 'Keep case', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => { if (onAction({ type: 'remove', id: item.id })) setMessage('Case removed.'); } }])} />
          </View>)}
        </View>
        <View style={[s.card, { backgroundColor: '#FFD85A' }]}><Text accessibilityRole="header" style={s.subtitle}>The savings casebook</Text><Text style={s.value}>{money(summary.avoidedAnnual)}/year</Text><Text style={s.body}>Estimated future cost avoided for cases you marked cancelled, at their entered rates. This is a projection, not money deposited or verified savings.</Text></View>
        <View style={[s.card, { backgroundColor: '#BBF5E8' }]}><Text accessibilityRole="header" style={s.subtitle}>Quiet renewal reminders</Text><Text style={s.body}>An optional note three days before and on your saved trial-end or renewal date, at 9 AM in your phone’s time zone. Names and amounts stay off the notification.</Text>
          {!reminderStatus.supported ? <Text style={s.note}>Notifications are available in the iPhone and Android apps.</Text> : <><Button disabled={permissionBusy} label={permissionBusy ? 'Checking notifications…' : finance.subscriptionReminders?.enabled ? 'Turn off Clubhouse reminders' : 'Enable Clubhouse reminders'} onPress={reminders} />
            <Text style={s.note}>{reminderStatus.error ? 'Could not update reminders. Reopen PayPlace to try again.' : reminderStatus.permissionBlocked ? 'Notifications are blocked in your phone’s settings.' : `${reminderStatus.count} upcoming reminder days scheduled.`} The next 12 reminder days are scheduled; reopen PayPlace to refresh. Enter the next renewal after each cycle. Phone settings can delay delivery.</Text>
            {reminderStatus.permissionBlocked && <Button secondary label="Open notification settings" onPress={() => Linking.openSettings()} />}</>}
        </View>
        <Button secondary label="Review subscription expenses in Bills" onPress={() => { close(); onBills(); }} /><Text style={s.note}>Add an expense in Bills to reserve money for it. Clubhouse entries and linked bills do not sync amounts or payment status automatically. Cancel through the provider or app store, then update your bill separately.</Text><Button label="Back to the neighborhood" onPress={close} />
      </ScrollView>
    </KeyboardAvoidingView></SafeAreaView>
  </Modal>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF4D7' }, header: { padding: 18, flexDirection: 'row', alignItems: 'center', gap: 8 }, flex: { flex: 1 }, close: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' }, content: { padding: 18, paddingTop: 0, paddingBottom: 40 },
  entry: { borderRadius: 26, borderWidth: 2, borderColor: '#D4A34E', overflow: 'hidden', backgroundColor: '#F5E4FF', marginBottom: 18 }, entryCopy: { padding: 18 }, entryAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#5935B5', borderRadius: 16, padding: 14, marginTop: 16, flexWrap: 'wrap' },
  artFrame: { width: '100%', backgroundColor: '#F7DDAD', borderRadius: 22, overflow: 'hidden' }, art: { width: '100%', height: '100%' }, eyebrow: { color: '#5935B5', fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 8 }, title: { fontSize: 25, fontWeight: '900', color: '#142445' }, quote: { fontSize: 18, fontWeight: '800', color: '#5935B5', marginVertical: 14 }, body: { fontSize: 15, lineHeight: 23, color: '#243653' }, note: { fontSize: 13, lineHeight: 20, color: '#3E4B63', marginTop: 10 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }, stat: { flexGrow: 1, flexBasis: 140, padding: 16, borderRadius: 20 }, value: { fontSize: 25, fontWeight: '900', color: '#142445' }, subtitle: { fontSize: 20, fontWeight: '900', color: '#142445', marginBottom: 8 }, card: { borderRadius: 24, padding: 16, marginTop: 18 },
  field: { marginTop: 14 }, label: { color: '#142445', fontSize: 14, fontWeight: '800', marginBottom: 7 }, input: { backgroundColor: '#F8FBFF', borderRadius: 14, borderColor: '#93BAC8', borderWidth: 1, color: '#142445', fontSize: 16, padding: 13, minHeight: 48 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { padding: 12, minHeight: 48, backgroundColor: '#F6F0FF', borderRadius: 14, justifyContent: 'center' }, selected: { backgroundColor: '#5935B5' }, choiceText: { color: '#30204F', fontWeight: '800', fontSize: 14 },
  button: { minHeight: 48, backgroundColor: '#5935B5', borderRadius: 16, padding: 14, alignItems: 'center', justifyContent: 'center', marginTop: 12 }, secondary: { backgroundColor: '#F6F0FF' }, buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', textAlign: 'center' }, billChoice: { padding: 12, marginTop: 8, backgroundColor: '#EFFBFF', borderRadius: 14, minHeight: 48 }, dateRow: { paddingVertical: 14, minHeight: 48, borderBottomWidth: 1, borderBottomColor: '#C7897D' }, case: { padding: 14, backgroundColor: '#F1E8FF', borderRadius: 18, marginTop: 14 }, notice: { color: '#142445', backgroundColor: '#BBF5E8', borderRadius: 16, padding: 14, fontWeight: '700', lineHeight: 22, marginTop: 14 },
});
