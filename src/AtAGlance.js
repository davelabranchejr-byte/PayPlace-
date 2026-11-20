import React, { useEffect, useState } from 'react';
import { AppState, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Privacy';
import { MascotTouchable } from './MascotTouchable';
import PayPlaceBrand from './PayPlaceBrand';
import FittedArtwork from './FittedArtwork';
import { payplaceColors as colors } from './brand';
import { atAGlance } from './at-a-glance.mjs';
import { billDate } from './bill-reminders.mjs';

const money = value => `${Number(value) < 0 ? '-' : ''}$${Math.abs(Number(value)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateLabel = value => {
  const date = billDate(value);
  return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date needed';
};
function Section({ title, value, tone, children, testID }) {
  return <View testID={testID} style={[s.section, { borderColor: tone }]}>
    <View style={[s.sectionHeader, { backgroundColor: tone }]}>
      <Text accessibilityRole="header" style={s.sectionTitle}>{title}</Text>
      {value && <Text style={s.sectionValue}>{value}</Text>}
    </View>
    <View style={s.sectionBody}>{children}</View>
  </View>;
}
function Row({ label, detail, value }) {
  return <View style={s.row}>
    <Text style={s.rowLabel}>{label}</Text>
    {detail && <Text style={s.rowDetail}>{detail}</Text>}
    <Text style={s.rowValue}>{value}</Text>
  </View>;
}
export default function AtAGlance({ finance, sample = false, onBack }) {
  const { width, fontScale } = useWindowDimensions();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const interval = setInterval(refresh, 60000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { clearInterval(interval); listener.remove(); };
  }, []);
  const model = atAGlance(finance, now);
  const { budget } = model;
  const narrow = width < 360 || fontScale > 1.3;
  return <View style={s.screen} testID="at-a-glance-screen">
    <View style={s.brandRow}>
      <PayPlaceBrand compact style={s.brand} />
      <Text style={s.mode}>{sample ? 'Sample data' : 'Manual Mode'}</Text>
    </View>
    <ScrollView style={s.scroll} contentContainerStyle={s.content} testID="at-a-glance-content">
      <View style={s.titleRow}>
        <MascotTouchable artworkMode="integrated" accessibilityRole="button" accessibilityLabel="Back to Budget"
          onPress={onBack} style={s.back} testID="at-a-glance-back">
          <Ionicons name="chevron-back" size={18} color="#08796E" /><Text style={s.backText}>Budget</Text>
        </MascotTouchable>
        <Text accessibilityRole="header" style={s.title}>At a Glance</Text>
        <FittedArtwork source={require('../assets/characters/safe-to-spend-budget-workshop.jpg')}
          style={s.mascots} accessible={false} />
      </View>
      <View style={s.hero} testID="glance-safe-to-spend">
        <View style={[s.heroNumbers, narrow && s.stacked]}>
          <View style={s.heroColumn}><Text style={s.heroLabel}>Safe to Spend</Text>
            <Text style={s.amount}>{money(budget.available)}</Text>
            <Text style={s.heroNote}>After reserves below</Text></View>
          <View style={s.heroColumn}><Text style={s.heroLabel}>Account balance</Text>
            <Text style={s.balance}>{model.hasBalance ? money(budget.balance) : 'Balance not set'}</Text>
            <Text style={s.heroNote}>Your entered balance</Text></View>
        </View>
        <View style={s.reserves}>
          <Text style={s.reserve}>Unpaid bills {money(budget.bills)}</Text>
          <Text style={s.reserve}>Debt payments {money(budget.debt)}</Text>
          <Text style={s.reserve}>Safety buffer {money(budget.buffer)}</Text>
        </View>
        {model.shortfallCents > 0 && <Text style={s.heroNote}>Reserves exceed available funds by {money(model.shortfallCents / 100)}.</Text>}
      </View>
      <View style={s.payday} testID="glance-payday">
        <Text style={s.sectionTitle}>Next paycheck</Text><Text style={s.sectionValue}>{model.hasPaycheckAmount ? money(model.paycheckCents / 100) : 'Amount not set'}</Text>
        <Text style={s.rowDetail}>{model.paydayDate ? `${dateLabel(model.paydayDate)} · ${!model.payday.validPayday ? 'Update saved payday' : model.payday.days === 0 ? 'Today' : `${model.payday.days} days`}` : 'Payday not set'}</Text>
      </View>
      <Section title="Unpaid bills" value={money(budget.bills)} tone="#FFF0A0" testID="glance-bills">
        {model.bills.length ? model.bills.map((bill, index) => <Row key={bill.id || index} label={bill.name || 'Bill'}
          detail={`${bill.overdue ? 'Overdue · ' : ''}${dateLabel(bill.date)}`} value={money(bill.amountCents / 100)} />)
          : <Text style={s.empty}>No unpaid bills recorded.</Text>}
      </Section>
      <Section title="Debt payments" value={money(model.debtPaymentCents / 100)} tone="#FFD9D4" testID="glance-debt">
        <Row label="Total debt remaining" value={money(model.debtBalanceCents / 100)} />
        {model.debts.length ? model.debts.map((debt, index) => <Row key={debt.id || index} label={debt.name || 'Debt'}
          detail={`Payment ${money(debt.minimumCents / 100)}${debt.dueDate || debt.due ? ` · ${dateLabel(debt.dueDate || debt.due)}` : ''}`}
          value={money(debt.balanceCents / 100)} />) : <Text style={s.empty}>No debts recorded.</Text>}
      </Section>
      <Section title="Savings goals" tone="#EBD7FF" testID="glance-savings">
        {model.goals.length ? model.goals.map(goal => <View key={goal.id} style={s.goal}>
          <Row label={goal.name} value={`${money(goal.savedCents / 100)} / ${money(goal.targetCents / 100)}`} />
          <View style={s.track} accessible={false}><View style={[s.progress, { width: `${goal.percent}%` }]} /></View>
          <View style={s.row}><Text style={s.rowDetail}>{goal.percent}% saved</Text><Text style={s.rowDetail}>{money(goal.remainingCents / 100)} to go</Text></View>
        </View>) : <Text style={s.empty}>No savings goals recorded.</Text>}
      </Section>
      <Section title={`Recorded spending · ${model.month}`} value={money(model.spendingCents / 100)} tone="#C9F4EC" testID="glance-spending">
        {model.spending.length ? model.spending.map(item => <Row key={item.category} label={item.category} value={money(item.cents / 100)} />)
          : <Text style={s.empty}>No purchases recorded this month.</Text>}
        <Text style={s.note}>Purchase records do not reduce your balance.</Text>
      </Section>
      <Text style={s.note}>{sample ? 'Fictional sample balances' : model.balanceSource}{model.balanceUpdatedAt
        ? ` · Updated ${new Date(model.balanceUpdatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : ' · Update time not recorded'}</Text>
    </ScrollView>
  </View>;
}
const s = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, backgroundColor: '#FFFDF8' },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, paddingVertical: 5 },
  brand: { flex: 1 }, mode: { fontSize: 11, fontWeight: '800', color: '#08796E', backgroundColor: '#DCFAF4', borderRadius: 12, padding: 7, flexShrink: 1 },
  scroll: { flex: 1, minHeight: 0 }, content: { paddingHorizontal: 10, paddingBottom: 6, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  back: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingRight: 5 },
  backText: { color: '#08796E', fontSize: 13, fontWeight: '800' },
  title: { color: colors.ink, fontSize: 21, fontWeight: '900', flex: 1 },
  mascots: { width: 57, height: 38 },
  hero: { backgroundColor: '#087F75', borderRadius: 15, padding: 10, gap: 7 },
  heroNumbers: { flexDirection: 'row', gap: 10 }, stacked: { flexDirection: 'column' }, heroColumn: { flex: 1, minWidth: 0 },
  heroLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  amount: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', fontVariant: ['tabular-nums'] },
  balance: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', fontVariant: ['tabular-nums'] },
  heroNote: { color: '#FFFFFF', fontSize: 11, lineHeight: 14 },
  reserves: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: '#E2F7F2', borderRadius: 8, padding: 6, justifyContent: 'space-between' },
  reserve: { fontSize: 11, fontWeight: '800', color: colors.ink },
  payday: { backgroundColor: '#EBD7FF', borderRadius: 9, padding: 8, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 5 },
  section: { borderWidth: 1, borderRadius: 10, overflow: 'hidden', flexShrink: 0 },
  sectionHeader: { paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 4 },
  sectionTitle: { color: colors.ink, fontSize: 13, fontWeight: '900', flexShrink: 1 },
  sectionValue: { color: colors.ink, fontSize: 14, fontWeight: '900', fontVariant: ['tabular-nums'] },
  sectionBody: { paddingHorizontal: 8, paddingVertical: 3, gap: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', columnGap: 8, rowGap: 1, paddingVertical: 1 },
  rowLabel: { flex: 1, minWidth: 65, color: colors.ink, fontSize: 13, lineHeight: 17, fontWeight: '700' },
  rowDetail: { color: '#46546A', fontSize: 12, lineHeight: 16, flexShrink: 1 },
  rowValue: { color: colors.ink, fontSize: 13, lineHeight: 17, fontWeight: '800', fontVariant: ['tabular-nums'] },
  goal: { gap: 1 }, track: { height: 5, backgroundColor: '#E3E0E7', borderRadius: 3, overflow: 'hidden' },
  progress: { height: 5, backgroundColor: colors.purple },
  empty: { color: '#46546A', fontSize: 12, lineHeight: 17, paddingVertical: 2 },
  note: { fontSize: 11, lineHeight: 15, color: '#46546A', textAlign: 'center' },
});
