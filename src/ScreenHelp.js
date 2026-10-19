import React, { useState } from 'react';
import { neighborhoodLabel } from './neighborhood-destinations.mjs';
import { Modal, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "./Privacy";

const TAB_HELP = {
  Spa: { summary: 'Em’s cozy neighborhood pet spa.', steps: [
    'Scenes rotate every twelve seconds while the app is active. Use Previous, Next, or the thumbnails to choose a scene and pause the rotation.',
    'Tap the character button for a little reply. Play resumes the scene rotation; reduced motion keeps the artwork still.',
    'Use the tabs along the bottom to open a feature group. Hide gives the artwork more room; Show brings the tabs back.',
  ] },
  Annie: { summary: 'Come inside Annie’s house, visit the library, and meet the family.', steps: ['Tap Emma’s book or its reserved shelf spot in Annie’s Neighborhood Library.', 'Choose a reader to borrow the illustrated copy. Its shelf stays empty until you return it; the checkout ledger remembers each visit.', 'Tap View Emma’s book on Amazon to find the memoir. Borrowing does not unlock an ebook in PayPlace.', 'Visit the mascot rooms to see their current reads. Manual loans wait for your return; the reading circle changes on a new day.', 'Tap any portrait on the family wall to read their story, or open the belonging quilt.', 'Use Back or the building tabs to return to your money tools.'] },
  Bobbie: { summary: 'Visit Bobbie’s smart mirror and boutique.', steps: ['Use the smart mirror to check a purchase against your saved budget.', 'Record a treat or save a look using the existing mirror controls.', 'Budget Corner opens your budget; the building tabs take you home.'] },
  Westley: { summary: 'A gentle place to pause with Westley.', steps: ['Visit the Calm Garden, review your bills, or peek into Em’s Pet Spa.', 'Read Westley’s story to learn how he found his home.', 'Use the building tabs to return to your plan.'] },
  Tate: { summary: 'One small bite at a time with Tate.', steps: ['Choose one small task and tap Take a look.', 'Mark done records today’s progress. Undo removes that mark.', 'Read Tate’s story or return to the neighborhood when you are ready.'] },
  Chapo: { summary: 'Make room for a treat with Chapo.', steps: ['Open the extra-paycheck calendar to plan your bonus paydays.', 'Use the calendar’s existing split controls or visit Budget Corner.', 'Read Chapo’s story and return home using the building tabs.'] },
  Neighborhood: {summary:'All your character visits and quiet moments in one place.',steps:['Choose a character’s house, Em’s Pet Spa or Calm Garden.', 'Quiet Mode controls reminders, animation and hidden amounts.', 'Back to Neighborhood returns to these visits; the bottom tabs return to money tools.']},
  Home: { summary:'Your short money overview and a clear entrance to the banking demo.', steps:[
    'Try Bobbie’s banking demo opens public demo credentials. Fictional activity remains separate from your personal plan.',
    'Safe to Spend uses your entered balance, bills, debt and buffer. Budget holds payday planning, the extra-paycheck calendar and savings goals.',
    'Bills holds payment history and Subscription Detective. Plaid Banking holds accounts, savings automation, monitoring and credit.',
    'Neighborhood holds character visits, the spa and Calm Garden. One small step offers a suggested next action.',
  ] },
  Billiam: {summary:'Visit Billiam’s mailbox outside Annie Oak Tree.',steps:['Choose an illustrated tool to scan/import bills, compare charges, remember a recurring cycle or review a breakdown. Every scan needs your review before it is saved.','Our household plan assigns bill responsibility and creates password-protected files containing only selected bills. Review received files; updates must be shared again.','Swipe the bottom tabs to visit other places.']},
  Bills: { summary: 'Keep a list of what you owe and when it is due.', steps: [
    'Enter a bill name, amount and due date, then add it. Review opens its details so you can check or edit them.',
    'After paying through your bank or the bill provider, tap Record payment to record it here. Undo record puts the bill back on your unpaid list. Bills payment history shows changes and lets you correct a recorded amount.',
    'Sample bills let you try the review flow. They enter your saved list if you add them. PayPlace does not send a payment in this beta.',
  ] },
  Budget: { summary: 'Enter the numbers that power your planning screens.', steps: [
    'Enter the money available now, your expected next paycheck, payday and emergency buffer. These entries save as you edit them.',
    'Safe to Spend subtracts unpaid bills, debt minimums and your buffer from your current balance. An expected paycheck is not money available now.',
    'Open Until next payday, Extra Paycheck Calendar or Savings Goals from Budget. Credit entries and fictional credit previews live in Plaid Banking.',
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
    'Enter or update your own credit score in Your saved credit entry below. A live credit report requires a future approved integration.',
  ] },
  accounts: { summary: 'Set up fictional accounts for trying the Plaid Banking controls.', steps: [
    'Tap Connect sample accounts. The sample setup never opens a real bank account. The prominent Bobbie demo uses public username Bobbie and password litterbox.',
    'Go Back to Plaid Banking and choose a feature. Round-ups and payday savings each have their own on/off switch.',
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
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close tab instructions" onPress={onClose} style={s.button}><Text style={s.buttonText}>Back to {neighborhoodLabel(tab)}</Text></TouchableOpacity>
      <Text accessibilityRole="header" style={s.heading}>{neighborhoodLabel(tab)}: a place to start</Text>
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
