import React, { useRef, useState } from 'react';
import { Modal, ScrollView, View, StyleSheet } from 'react-native';
import { Text, TextInput } from './Privacy';
import FittedArtwork from './FittedArtwork';
import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import { micropaymentTargets, micropaymentTotal, canUndoMicropayment } from './micropayments.mjs';

const westleyArtwork = require('../assets/characters/feature-micropayments-westley.png');
const billiamArtwork = require('../assets/characters/bills-micropayments-billiam.jpg');
const money = cents => `$${(cents / 100).toFixed(2)}`;
function Button({ title, onPress, selected, disabled, testID }) {
  return <TouchableOpacity artworkMode="integrated" accessibilityRole="button" accessibilityLabel={title}
    accessibilityState={{ selected: !!selected, disabled: !!disabled }} disabled={disabled} testID={testID}
    onPress={onPress} style={[s.button, selected && s.selected, disabled && { opacity: 0.45 }]}>
    <Text style={s.buttonText}>{title}</Text>
  </TouchableOpacity>;
}

export function MicropaymentsButton({ onPress, forBills = false }) {
  return <TouchableOpacity artworkMode="integrated" testID="open-micropayments" accessibilityRole="button"
    accessibilityLabel="Micropayments: small extra payments" onPress={onPress} style={s.entry}>
    <FittedArtwork source={forBills ? billiamArtwork : westleyArtwork} aspectRatio={3 / 2}
      resizeMode="cover" testID="micropayments-shortcut-artwork" accessible={false} />
    <View style={s.caption}>
      <Text style={s.title}>Micropayments</Text>
      <Text style={s.body}>Track small extra payments.</Text>
    </View>
  </TouchableOpacity>;
}

function Content({ finance, onRecord, onUndo }) {
  const [selection, setSelection] = useState(null);
  const [amount, setAmount] = useState('5');
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const [sort, setSort] = useState('interest');
  const saving = useRef(false);
  const targets = micropaymentTargets(finance, sort);
  const target = targets.find(item => item.id === selection?.id && item.type === selection?.type);
  function review() {
    try { onRecord({ type: target?.type, targetId: target?.id, amount }, true); saving.current = false; setConfirming(true); setMessage(''); }
    catch (error) { setMessage(error.message); }
  }
  function save() {
    if (saving.current) return;
    saving.current = true;
    try {
      onRecord({ type: target?.type, targetId: target?.id, amount });
      setConfirming(false);
      setMessage('Extra payment recorded. Your entered bank balance was not changed.');
    } catch (error) { saving.current = false; setMessage(error.message); setConfirming(false); }
  }
  return <View style={s.section}>
    <Text accessibilityRole="header" style={s.title} numberOfLines={1} adjustsFontSizeToFit>Micropayments</Text>
    <Text style={s.body}>An extra dollar counts, too. Choose a bill or debt and record a small payment after you make it through your biller.</Text>
    <View style={s.notice}><Text style={s.body}>Manual tracking · PayPlace does not send money. Bank-connected sending is planned for a future update.</Text></View>
    <Text style={s.total}>Extra payments recorded: {money(micropaymentTotal(finance))}</Text>
    {finance.planSource === 'Sample' && <Text style={s.notice}>Sample neighborhood · These records use fictional amounts.</Text>}
    <Text accessibilityRole="header" style={s.heading}>1. Choose a bill or debt</Text>
    <View style={s.amounts}>
      <Button title="Highest interest first" selected={sort === 'interest'} onPress={() => setSort('interest')} />
      <Button title="Smallest amount first" selected={sort === 'amount'} onPress={() => setSort('amount')} />
    </View>
    <Text style={s.note}>Highest interest focuses on interest costs; smallest amounts focus on quick wins. Keep required payments in your plan. Bill amounts are regular bill amounts, not total debt balances. Missing interest rates appear last in interest order.</Text>
    {!targets.length && <Text style={s.body}>Add a bill or debt first, then come back here when you’re ready.</Text>}
    {targets.map(item => <Button key={`${item.type}-${item.id}`} title={`${item.name} · ${item.type === 'bill' ? `Bill amount · ${money(Math.round(Number(item.amount || 0) * 100))}` : `Debt balance · ${money(Math.round(Number(item.balance) * 100))}`} · ${item.interestRate == null ? 'Interest rate not entered' : `${item.interestRate}% APR`}`}
      selected={target?.id === item.id && target?.type === item.type} onPress={() => { setSelection({ id: item.id, type: item.type }); setConfirming(false); setMessage(''); }} />)}
    <Text accessibilityRole="header" style={s.heading}>2. Choose an extra amount</Text>
    <View style={s.amounts}>{[1, 5, 10].map(value => <Button key={value} title={`$${value}`} selected={amount === String(value)} onPress={() => { setAmount(String(value)); setConfirming(false); }} />)}</View>
    <Text style={s.body}>Or enter your own amount</Text>
    <TextInput accessibilityLabel="Custom micropayment amount" keyboardType="decimal-pad" value={amount}
      onChangeText={value => { setAmount(value); setConfirming(false); }} style={s.input} />
    <Text style={s.body}>{target?.type === 'debt' ? 'Recording reduces this entered debt balance. Keep your regular minimum payments in your plan.' : 'Bill extras are tracked separately. They do not mark your regular bill paid or change its amount or due date. Confirm any credit with your biller.'}</Text>
    <Text style={s.note}>Only use money you choose to spare. This screen does not calculate what is safe to spend.</Text>
    {!confirming ? <Button title="Review extra payment record" disabled={!target} onPress={review} /> : <View style={s.confirm}>
      <Text style={s.heading}>Record ${amount} toward {target?.name}?</Text>
      <Text style={s.body}>Confirm only after making this extra payment outside PayPlace. Saving this record does not move money.</Text>
      <Button title="I paid my biller — save record" onPress={save} />
      <Button title="Cancel record" onPress={() => setConfirming(false)} />
    </View>}
    <Text accessibilityLiveRegion="polite" style={s.body}>{message}</Text>
    <Text accessibilityRole="header" style={s.heading}>Your small wins</Text>
    {!(finance.micropayments || []).length && <Text style={s.body}>Your extra payment records will appear here.</Text>}
    {[...(finance.micropayments || [])].reverse().map(event => <View key={event.id} style={s.record}>
      <Text style={s.heading}>{event.name} · {money(event.amountCents)}</Text>
      <Text style={s.note}>{new Date(event.at).toLocaleString()} · {event.undoneAt ? 'Record undone' : 'Manually recorded extra payment'}</Text>
      {canUndoMicropayment(finance, event) && <Button title={`Undo extra payment record for ${event.name}`} onPress={() => {
        try { onUndo(event.id); setMessage('Record undone. No bank payment was reversed.'); } catch (error) { setMessage(error.message); }
      }} />}
    </View>)}
  </View>;
}

export default function Micropayments({ visible, onClose, finance, onRecord, onUndo }) {
  return <Modal visible={visible} onRequestClose={onClose} animationType={finance.quietMode?.reduceAnimation ? 'none' : 'slide'}>
    {visible && <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Button title="Back to my plan" onPress={onClose} />
      <Content finance={finance} onRecord={onRecord} onUndo={onUndo} />
    </ScrollView>}
  </Modal>;
}
const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 55, paddingBottom: 48, gap: 16, backgroundColor: '#F1FDFF' },
  section: { gap: 14 }, entry: { borderRadius: 22, borderWidth: 2, backgroundColor: '#FFE455', borderColor: '#E1AC00', marginTop: 12, overflow: 'hidden' },
  caption: { padding: 14, gap: 4 },
  title: { fontSize: 25, fontWeight: '900', color: '#101344' }, heading: { fontSize: 18, fontWeight: '800', color: '#101344' },
  body: { fontSize: 16, lineHeight: 24, color: '#263651' }, note: { fontSize: 14, lineHeight: 21, color: '#43546B' },
  total: { fontSize: 22, fontWeight: '900', color: '#5E278E' }, notice: { backgroundColor: '#FFF1AC', padding: 14, borderRadius: 16 },
  button: { padding: 14, borderRadius: 16, minHeight: 48, backgroundColor: '#B6F6F2', borderColor: '#00AABF' },
  buttonText: { fontSize: 17, fontWeight: '800', color: '#101344' }, selected: { backgroundColor: '#E6C4FF', borderColor: '#6C2BA1', borderWidth: 3 },
  amounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, input: { backgroundColor: 'white', borderWidth: 2, borderColor: '#00AABF', padding: 14, borderRadius: 14, fontSize: 20 },
  record: { padding: 16, borderRadius: 18, backgroundColor: '#EDE1FF', gap: 10 }, confirm: { backgroundColor: '#FFD7CC', padding: 16, borderRadius: 18, gap: 12 },
});
