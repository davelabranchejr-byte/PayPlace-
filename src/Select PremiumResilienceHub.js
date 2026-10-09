import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  DEFAULT_PREMIUM_STATE,
  buildBillShockPlans,
  buildCatchUpPlan,
  recoveryMessage,
} from './premium-resilience.mjs';

const FEATURES = [
  ['sparkles', 'Round Up & Save', 'Small change. Bigger breathing room.'],
  ['leaf', 'Life Happens Fund', 'Your cushion for the stuff nobody planned.'],
  ['car-sport', 'Bill Shock Mode', 'When the unexpected hits, build a recovery plan.'],
  ['life-buoy', "Help, I'm Falling Behind", 'You do not need a lecture. You need a plan.'],
  ['eye', 'Automatic Money Watch', 'Bills, subscriptions and debt changes in one calm place.'],
  ['speedometer', 'Credit Center', 'See the credit picture without the shame spiral.'],
];

function Card({ icon, title, body, onPress }) {
  return <TouchableOpacity onPress={onPress} style={s.card} accessibilityRole="button">
    <View style={s.icon}><Ionicons name={icon} size={23} color="#6754E8" /></View>
    <View style={{ flex: 1 }}><Text style={s.cardTitle}>{title}</Text><Text style={s.body}>{body}</Text></View>
    <Ionicons name="chevron-forward" size={20} color="#667085" />
  </TouchableOpacity>;
}

export default function PremiumResilienceHub({ visible, onClose, finance = {}, premiumState = DEFAULT_PREMIUM_STATE, onPremiumStateChange = () => {}, onOpenBankConnections, onOpenSubscriptions }) {
  const [panel, setPanel] = useState(null);
  const [shockAmount, setShockAmount] = useState('');
  const bills = finance.bills || [];
  const catchUp = useMemo(() => buildCatchUpPlan({ bills, availableCash: finance.balance || 0, nextIncome: finance.paycheckAmount || 0 }), [bills, finance.balance, finance.paycheckAmount]);
  const shock = useMemo(() => buildBillShockPlans({
    expense: shockAmount,
    balance: finance.balance || 0,
    nextIncome: finance.paycheckAmount || 0,
    upcomingEssentialBills: bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
    lifeHappensBalance: premiumState.lifeHappensBalance || 0,
  }), [shockAmount, finance.balance, finance.paycheckAmount, bills, premiumState.lifeHappensBalance]);

  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={s.page}>
      <View style={s.header}><View style={{ flex: 1 }}><Text style={s.kicker}>PAYPLACE PREMIUM</Text><Text style={s.title}>Financial breathing room for real life.</Text><Text style={s.subtitle}>Prepared for the unexpected. Supported through the recovery.</Text></View><TouchableOpacity onPress={onClose} style={s.close}><Ionicons name="close" size={25} color="#071A3A" /></TouchableOpacity></View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.promise}><Text style={s.promiseTitle}>Set it once.</Text><Text style={s.promiseBody}>PayPlace quietly helps you prepare, recover, and rebuild without turning a hard month into a character judgment.</Text></View>
        {FEATURES.map(([icon, title, body]) => <Card key={title} icon={icon} title={title} body={body} onPress={() => {
          if (title === 'Automatic Money Watch' && onOpenSubscriptions) onOpenSubscriptions();
          else if (title === 'Credit Center') setPanel('credit');
          else setPanel(title);
        }} />)}

        {panel === 'Life Happens Fund' && <View style={s.panel}><Text style={s.panelTitle}>Life Happens Fund</Text><Text style={s.body}>Current cushion: ${Number(premiumState.lifeHappensBalance || 0).toFixed(2)} of ${Number(premiumState.lifeHappensTarget || 500).toFixed(2)}</Text><Text style={s.body}>{recoveryMessage(premiumState)}</Text><TouchableOpacity style={s.primary} onPress={() => onPremiumStateChange({ ...premiumState, rebuildMode: false })}><Text style={s.primaryText}>Keep building my cushion</Text></TouchableOpacity></View>}

        {panel === 'Round Up & Save' && <View style={s.panel}><Text style={s.panelTitle}>Round Up & Save</Text><Text style={s.body}>Turn everyday purchases into tiny deposits toward your safety net. Choose 1x, 2x or 3x and set a cap so the automation never gets bossy.</Text></View>}

        {panel === 'Bill Shock Mode' && <View style={s.panel}><Text style={s.panelTitle}>Bill Shock Mode</Text><TextInput value={shockAmount} onChangeText={setShockAmount} keyboardType="decimal-pad" placeholder="Unexpected expense" style={s.input} /><Text style={s.body}>Fastest: pay ${shock.fastest.payNow.toFixed(2)} now. Remaining ${shock.fastest.remaining.toFixed(2)}.</Text><Text style={s.body}>Balanced: {shock.balanced.periods ? `${shock.balanced.periods} payments around $${shock.balanced.payment.toFixed(2)}` : 'covered with current resources'}.</Text><Text style={s.body}>Life Happens Fund available: ${shock.useFund.fundUse.toFixed(2)}.</Text></View>}

        {panel === "Help, I'm Falling Behind" && <View style={s.panel}><Text style={s.panelTitle}>Help, I’m Falling Behind</Text><Text style={s.quote}>You do not need a lecture. You need a plan.</Text><Text style={s.body}>PayPlace protects essentials first, then builds a catch-up path that does not make next month worse.</Text><Text style={s.body}>Available to assign: ${catchUp.resources.toFixed(2)} · Remaining shortfall: ${catchUp.totalShortfall.toFixed(2)}</Text>{catchUp.steps.slice(0, 6).map(step => <View key={step.id} style={s.row}><Text style={s.rowTitle}>{step.name || step.title || step.id}</Text><Text style={s.rowValue}>${step.recommendedPayment.toFixed(2)}</Text></View>)}</View>}

        {panel === 'credit' && <View style={s.panel}><Text style={s.panelTitle}>Credit Center</Text><Text style={s.body}>Credit score, report, utilization, payment history, open accounts and change alerts belong here. The provider connection stays inactive until PayPlace has approved production access.</Text></View>}

        <TouchableOpacity style={s.bank} onPress={onOpenBankConnections}><Ionicons name="link" size={21} color="#075E54" /><Text style={s.bankText}>Connect accounts for Premium automation</Text></TouchableOpacity>
      </ScrollView>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F6FBFF' }, header: { padding: 22, paddingTop: 52, flexDirection: 'row', backgroundColor: '#FFFFFF' },
  kicker: { fontSize: 12, fontWeight: '900', color: '#6754E8', letterSpacing: 1.2 }, title: { fontSize: 28, lineHeight: 34, fontWeight: '900', color: '#071A3A', marginTop: 7 }, subtitle: { fontSize: 15, lineHeight: 22, color: '#536178', marginTop: 7 }, close: { padding: 8 },
  content: { padding: 18, gap: 13, paddingBottom: 50 }, promise: { backgroundColor: '#DFFCF7', borderRadius: 20, padding: 18 }, promiseTitle: { fontSize: 20, fontWeight: '900', color: '#075E54' }, promiseBody: { fontSize: 15, lineHeight: 22, color: '#334660', marginTop: 5 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16 }, icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EEE9FF', alignItems: 'center', justifyContent: 'center' }, cardTitle: { fontSize: 17, fontWeight: '800', color: '#071A3A' }, body: { fontSize: 14, lineHeight: 21, color: '#536178', marginTop: 3 },
  panel: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 17, gap: 10 }, panelTitle: { fontSize: 20, fontWeight: '900', color: '#071A3A' }, quote: { fontSize: 16, lineHeight: 23, fontWeight: '800', color: '#6754E8' }, input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 13, padding: 13, fontSize: 17, backgroundColor: '#FFFFFF' }, primary: { backgroundColor: '#6754E8', padding: 14, borderRadius: 13, alignItems: 'center' }, primaryText: { color: '#FFFFFF', fontWeight: '900' }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: '#E7EEF5', paddingTop: 10 }, rowTitle: { flex: 1, color: '#334660', fontWeight: '700' }, rowValue: { color: '#071A3A', fontWeight: '900' }, bank: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#DFFCF7', padding: 15, borderRadius: 16 }, bankText: { color: '#075E54', fontWeight: '900' },
});
