import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Privacy';
import EntrySheet from './EntrySheet';
import ExpandableSection from './ExpandableSection';
import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import { bankSpending } from './bank-activity.mjs';
import { dateKey, readDate } from './paycheck-calendar.mjs';
import { monthEndOutlook } from './money-outlook.mjs';
import { savingsProgress } from './savings-goals.mjs';

const money = cents => `${cents < 0 ? '-' : ''}$${(Math.abs(cents) / 100).toFixed(2)}`;

function AmountRow({ label, amount }) {
  return <View style={s.row}>
    <Text style={s.body}>{label}</Text>
    <Text style={s.amount}>{money(amount)}</Text>
  </View>;
}

export default function MoneyOutlook({ finance, onClose, sample }) {
  const [paychecks, setPaychecks] = useState(4);
  const now = (sample && readDate(finance.bankActivity?.clock)) || new Date();
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const outlook = monthEndOutlook(finance, now);
  const spending = bankSpending(finance, dateKey(now).slice(0, 7));
  const goals = finance.savingsGoals || [];

  return <EntrySheet visible title="Money outlook" onClose={onClose}>
    {sample && <Text style={s.body}>Sample plan · fictional data</Text>}
    <View style={s.summary}>
      <Text accessibilityRole="header" style={s.title}>Estimated money left at the end of {month}</Text>
      <Text style={s.total}>{money(outlook.estimate)}</Text>
      <AmountRow label="Entered balance" amount={outlook.balance} />
      <AmountRow label="Expected paychecks after today" amount={outlook.income} />
      <AmountRow label="Unpaid bills, including overdue and undated" amount={outlook.billsDue} />
      <AmountRow label="Debt minimums set aside" amount={outlook.debtMinimums} />
      <AmountRow label="Emergency buffer set aside" amount={outlook.buffer} />
      <Text style={s.body}>Based on your saved plan. Everyday spending and bills you haven’t entered are outside this estimate.</Text>
    </View>
    <ExpandableSection title={`Spending in ${month}`}>
      <Text style={s.body}>Gross purchase totals by category. Transfers, pending purchases, refunds and income are excluded.</Text>
      {spending.length ? spending.map(item => <AmountRow key={item.category} label={item.category} amount={item.amountCents} />)
        : <Text style={s.body}>No purchases recorded this month. Add them under Budget → Purchases and Categories.</Text>}
    </ExpandableSection>
    <ExpandableSection title="Savings per paycheck">
      {goals.length ? <>
        <Text style={s.body}>Choose how many paychecks to spread your remaining savings over. These targets are for planning.</Text>
        <View style={s.choices}>
          {[4, 8, 12].map(count => <TouchableOpacity key={count} accessibilityRole="button"
            accessibilityLabel={`${count} paychecks`} accessibilityState={{ selected: paychecks === count }}
            onPress={() => setPaychecks(count)} style={s.choice}>
            <Text style={s.amount}>{count} checks</Text>
          </TouchableOpacity>)}
        </View>
        {goals.map(goal => <AmountRow key={goal.id} label={goal.name}
          amount={Math.ceil(savingsProgress(goal).remainingCents / paychecks)} />)}
      </> : <Text style={s.body}>Add a savings goal first to see how much to set aside per paycheck.</Text>}
    </ExpandableSection>
  </EntrySheet>;
}

const s = StyleSheet.create({
  summary: { backgroundColor: '#FFF0A6', borderColor: '#DBA800', borderWidth: 2, borderRadius: 20, padding: 14, gap: 6, marginBottom: 12 },
  title: { color: '#071A3A', fontSize: 20, fontWeight: '900' },
  total: { color: '#071A3A', fontSize: 30, fontWeight: '900' },
  body: { color: '#243952', fontSize: 15, lineHeight: 21 },
  amount: { color: '#071A3A', fontSize: 16, fontWeight: '900' },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, paddingVertical: 5 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
  choice: { minHeight: 44, padding: 9, justifyContent: 'center', backgroundColor: '#65EBEF', borderColor: '#00AABF' },
});
