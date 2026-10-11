import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TAB_HELP = {
  Home: { summary: 'Your starting place for the neighborhood and your money overview.', steps: [
    'Start in Budget to enter your current balance, next paycheck and emergency buffer. Add your unpaid bills in Bills and debt minimums in Debt.',
    'Home uses those saved entries to estimate Safe to Spend. It is a planning guide, so update your entries when your money changes.',
    'Tap a labeled treehouse or the bottom tabs to visit a feature. Premium opens the sample automation tools; Calm gives you a moment to breathe.',
  ] },
  Bills: { summary: 'Keep a list of what you owe and when it is due.', steps: [
    'Enter a bill name, amount and due date, then add it. Review opens its details so you can check or edit them.',
    'After paying through your bank or the bill provider, tap Paid to record it here. Undo puts the bill back on your unpaid list.',
    'Sample bills let you try the review flow. They enter your saved list if you add them. PayPlace does not send a payment in this beta.',
  ] },
  Budget: { summary: 'Enter the numbers that power your planning screens.', steps: [
    'Enter the money available now, your expected next paycheck, payday and emergency buffer. These entries save as you edit them.',
    'Safe to Spend subtracts unpaid bills, debt minimums and your buffer from your current balance. An expected paycheck is not money available now.',
    'A credit score entered here is your own record; it is not verified. Premium keeps fictional balances and scores separate from these saved entries.',
  ] },
  Debt: { summary: 'Choose which debt to focus on and track payments you make elsewhere.', steps: [
    'Add each debt with its balance, interest rate and minimum payment.',
    'Choose Snowball for the smallest balance first, Avalanche for the highest interest rate first, or Mixed for a quick win followed by highest interest.',
    'Record payments after making them with your lender. This updates your plan; it does not send money or create a repayment agreement.',
  ] },
  Calm: { summary: 'Take a pause when the money stuff feels heavy.', steps: [
    'Visit the garden and choose a character to read their stories and encouragement.',
    'Tap Show me another story for a different message. There is no form to finish or money setting to change here.',
    'Use Home or another bottom tab whenever you are ready to return to your plan.',
  ] },
  Premium: { summary: 'Try financial cushioning and recovery tools during beta, without a charge.', steps: [
    'Tap an illustrated feature. Its How this works card explains the purpose, steps and result.',
    'Round-ups, payday savings, Money Watch and Credit Center use fictional sample accounts. Connect them from a feature or Account connections & beta setup.',
    'Recovery plans can use your saved entries or a fictional budget. Sample activity never moves money, pays bills or retrieves a credit report.',
  ] },
};

export const PREMIUM_HELP = {
  roundup: { summary: 'Save the spare change between a purchase and the next whole dollar.', steps: [
    'Connect sample accounts below, then turn on sample round-ups.',
    'Choose 1×, 2× or 3× and save a weekly cap. Example: $4.22 rounds up by $0.78; at 3× that becomes $2.34.',
    'Tap Simulate next purchase batch to add pretend savings. Each tap is another batch; the total stops at your saved weekly cap. Start a new sample week to reset that total.',
  ] },
  fund: { summary: 'Build a cushion by setting aside a chosen amount each payday.', steps: [
    'Connect sample accounts, enter your savings target and contribution per payday, then tap Save fund preferences.',
    'Turn on sample payday savings. Tap Simulate next payday to add your saved contribution to the sample fund, stopping at your target.',
    'Try Simulate a $50 emergency to use part of the sample cushion, then simulate another payday to rebuild it. The displayed sample balance is pretend money, separate from your saved real-life cushion.',
  ] },
  shock: { summary: 'Compare ways to recover from one unexpected expense.', steps: [
    'Choose your planning data. Switch on Use sample budget for this plan to practice, or leave it off to use your saved Budget and Bills entries.',
    'Enter the unexpected expense below. Recovery estimates appear after you enter an amount above zero.',
    'Compare Fastest, Balanced and Gentlest, then save your choice. This records a planning preference; it does not schedule payments or change your bills.',
  ] },
  catchup: { summary: 'See a suggested order for catching up with unpaid bills.', steps: [
    'Switch on Use sample budget for this plan to try an example, or leave it off to use your saved balance, expected paycheck and unpaid bills.',
    'Scroll to One step at a time. Read each bill’s amount owed, suggested planning amount and remaining shortfall. The plan includes expected income, so check when that money will actually arrive.',
    'Tap Review my bills to update your saved entries. Arrange any partial payments with the bill provider yourself; this screen does not pay bills.',
  ] },
  watch: { summary: 'Preview reminders about subscription renewals and bill changes.', steps: [
    'Connect sample accounts to show the fictional renewal and utility alerts.',
    'Refresh sample watch feed records another sample refresh. It shows the same example alerts; it does not scan a bank account or discover new charges.',
    'Open Subscription Detective to manage subscriptions you enter yourself. Record cancellation status after contacting the provider; PayPlace does not cancel for you.',
  ] },
  credit: { summary: 'Preview a credit dashboard without checking your actual credit.', steps: [
    'Connect sample accounts to display a fictional score.',
    'Refresh sample credit score switches the example between 712 and 716 so you can test the display. Neither number is your real score.',
    'Your saved credit entry below comes from the score you enter manually in Budget. A live credit report requires a future approved integration.',
  ] },
  accounts: { summary: 'Set up fictional accounts for trying the Premium controls.', steps: [
    'Tap Connect sample accounts. No bank login is needed, and no account is opened at a bank.',
    'Go Back to Premium and choose a feature. Round-ups and payday savings each have their own on/off switch.',
    'Disconnect pauses both sample savings switches. Reset sample activity restores the starter samples and disconnects them; it keeps your saved preferences, real budget and bills.',
  ] },
};

export function HowItWorks({ guide }) {
  const [showSteps, setShowSteps] = useState(true);
  if (!guide) return null;
  return <View style={s.card}>
    <Text accessibilityRole="header" style={s.title}>How this works</Text>
    <Text style={s.body}>{guide.summary}</Text>
    {showSteps && guide.steps.map((step, index) => <View key={step} style={s.step}><Text style={s.number}>{index + 1}.</Text><Text style={s.stepText}>{step}</Text></View>)}
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={showSteps ? 'Hide instructions' : 'Show instructions'} accessibilityState={{ expanded: showSteps }} onPress={() => setShowSteps(value => !value)} style={s.button}><Text style={s.buttonText}>{showSteps ? 'Got it — hide steps' : 'Show me the steps'}</Text></TouchableOpacity>
  </View>;
}

export default function ScreenHelp({ tab, visible, onClose }) {
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={s.page}><ScrollView contentContainerStyle={s.content}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close tab instructions" onPress={onClose} style={s.button}><Text style={s.buttonText}>Back to {tab}</Text></TouchableOpacity>
      <Text accessibilityRole="header" style={s.heading}>{tab}: a place to start</Text>
      <HowItWorks guide={TAB_HELP[tab]} />
      <Text style={s.body}>Manual Mode means you enter and maintain your own financial information. Banking connections and live payments are not enabled in this beta.</Text>
    </ScrollView></SafeAreaView>
  </Modal>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F6FBFF' }, content: { padding: 18, gap: 16, paddingBottom: 40 },
  card: { backgroundColor: '#E2FAF5', padding: 16, borderRadius: 18, gap: 10 },
  title: { color: '#075E54', fontSize: 18, fontWeight: '900' }, heading: { color: '#071A3A', fontSize: 24, fontWeight: '900' },
  body: { color: '#334660', fontSize: 14, lineHeight: 21 }, step: { flexDirection: 'row', gap: 8 },
  number: { color: '#075E54', fontSize: 14, lineHeight: 21, fontWeight: '900' }, stepText: { flex: 1, color: '#334660', fontSize: 14, lineHeight: 21 },
  button: { alignSelf: 'flex-start', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, backgroundColor: '#EEE9FF', minHeight: 48 },
  buttonText: { color: '#46349D', fontWeight: '800', fontSize: 15 },
});
