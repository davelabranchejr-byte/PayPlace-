import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MascotTouchable as TouchableOpacity } from './MascotTouchable';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$0.99',
    color: '#08796E',
    fill: '#65EBEF',
    heading: 'A gentle place to start',
    features: [
      ['Manual budget and Safe to Spend', 'Enter your balance and payday, then see what you can spend.', 'budget'],
      ['Bills, debts and reminders', 'Track bills, debts and subscriptions you enter yourself.', 'bills'],
      ['Monthly calendar', 'See due dates, recorded payments and paydays in one place.', 'monthlyCalendar'],
      ['Savings goals', 'Set a target and track your progress.', 'savings'],
      ['Spending categories', 'Organize purchases you enter.', 'spending'],
      ['Neighborhood', 'Visit the PayPlace mascots.', 'neighborhood'],
      ['Calm Garden', 'Take a quiet break with Annie and the mascots.', 'calm'],
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$4.99',
    color: '#8C5900',
    fill: '#FFE455',
    heading: 'Build momentum with your plan',
    includes: 'Everything in Basic, plus these tools. Enter your own information.',
    features: [
      ['Snowball, Mixed and Avalanche', 'Choose which debt to focus on and compare payoff approaches.', 'debt'],
      ['Micropayments tracker', 'Record small extra payments you make with your biller.', 'micropayments'],
      ['Extra Paycheck Calendar', 'See projected paydays and plan how to use extra checks.', 'extraCalendar'],
      ['Spending breakdowns', 'Review the categories in your entered purchase history.', 'spending'],
      ['Printable monthly calendar', 'Print your month in portrait or landscape.', 'printCalendar'],
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19.99',
    color: '#6925A0',
    fill: '#DCABFF',
    heading: 'Bring your accounts together',
    includes: 'Everything in Plus, with connected tools planned for Premium.',
    features: [
      ['Plaid bank sync', 'Connect supported accounts and import transactions.'],
      ['Automatic transaction categorization', 'Organize imported activity and review its categories.', 'sampleTransactions'],
      ['Subscription Detective', 'Find possible recurring charges and estimated renewal dates.', 'sampleSubscriptions'],
    ],
  },
];

const toolLabels = {
  budget: 'Open Budget',
  bills: 'Open Bills & Banking',
  monthlyCalendar: 'View calendar',
  savings: 'Open savings goals',
  neighborhood: 'Visit the Neighborhood',
  calm: 'Open Calm Garden',
  debt: 'Choose a payoff strategy',
  micropayments: 'Open Micropayments',
  extraCalendar: 'View extra paychecks',
  spending: 'Review purchases',
  printCalendar: 'Open printable calendar',
  sampleTransactions: 'Review sample transactions',
  sampleSubscriptions: 'Try with sample data',
};

export default function PayPlacePlans({ selectedId, onSelectPlan, onOpenTool, onOpenDemo }) {
  const { width, fontScale } = useWindowDimensions();
  const wrapTabs = width < 350 || fontScale > 1.3;
  const selected = plans.find(plan => plan.id === selectedId);

  return (
    <View style={styles.page}>
      <Text accessibilityRole="header" style={styles.title}>PayPlace plans</Text>
      <View accessibilityRole="tablist" style={[styles.tabs, wrapTabs && styles.wrapTabs]}>
        {plans.map(plan => (
          <TouchableOpacity key={plan.id} testID={`plan-${plan.id}`} accessibilityRole="tab" accessibilityLabel={plan.name}
            accessibilityState={{ selected: plan.id === selectedId }} onPress={() => onSelectPlan(plan.id)}
            style={[styles.tab, wrapTabs && styles.wideTab, { backgroundColor: plan.fill, borderColor: plan.color }]}>
            <Text style={styles.tabLabel}>{plan.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView key={selectedId} style={styles.details} contentContainerStyle={styles.content}>
        <View style={[styles.summary, { backgroundColor: selected.fill, borderColor: selected.color }]}>
          <Text accessibilityRole="header" style={styles.heading}>{selected.heading}</Text>
          <Text style={styles.price}>{selected.price} / month</Text>
          <Text style={styles.copy}>Proposed pricing · beta access is free</Text>
          {selected.includes && <Text style={styles.copy}>{selected.includes}</Text>}
        </View>
        {selected.id === 'premium' && (
          <Text style={styles.note}>Live bank sync and automatic subscription finding are planned. The Banking Demo uses fictional data.</Text>
        )}
        {selected.features.map(([title, detail, tool]) => (
          <View key={title} style={styles.feature}>
            <Text accessibilityRole="header" style={styles.featureTitle}>{title}</Text>
            <Text style={styles.copy}>{detail}</Text>
            {tool && <TouchableOpacity accessibilityRole="button" accessibilityLabel={selected.id === 'premium' ? `Try ${title} with sample data from Plans` : `Open ${title} from Plans`}
              onPress={() => onOpenTool(tool)} style={[styles.action, { backgroundColor: selected.fill, borderColor: selected.color }]}>
              <Text style={styles.actionLabel}>{toolLabels[tool]}</Text>
            </TouchableOpacity>}
          </View>
        ))}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Try free Banking Demo from Plans"
          onPress={onOpenDemo} style={[styles.action, styles.demo]}>
          <Text style={styles.actionLabel}>Try the free Banking Demo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, minHeight: 0, paddingHorizontal: 16, paddingTop: 8 },
  title: { color: '#071A3A', fontSize: 24, fontWeight: '900', marginBottom: 8 },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  wrapTabs: { flexWrap: 'wrap' },
  tab: { flex: 1, minHeight: 48, minWidth: 0, alignItems: 'center', justifyContent: 'center', padding: 6, borderRadius: 16, borderWidth: 2 },
  wideTab: { flexBasis: '44%' },
  tabLabel: { color: '#071A3A', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  details: { flex: 1 },
  content: { gap: 10, paddingBottom: 18 },
  summary: { borderRadius: 20, borderWidth: 2, padding: 14, gap: 4 },
  heading: { color: '#071A3A', fontSize: 20, fontWeight: '900' },
  price: { color: '#071A3A', fontSize: 20, fontWeight: '900' },
  feature: { padding: 12, gap: 6, borderRadius: 16, borderWidth: 1, borderColor: '#D7CBE8', backgroundColor: '#FFFCF7' },
  featureTitle: { color: '#071A3A', fontSize: 17, fontWeight: '900' },
  copy: { color: '#243952', fontSize: 15, lineHeight: 21 },
  note: { color: '#243952', fontSize: 15, lineHeight: 21, padding: 10, borderRadius: 12, backgroundColor: '#FFF0B5' },
  action: { alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center', borderRadius: 14 },
  actionLabel: { color: '#071A3A', fontSize: 15, fontWeight: '800' },
  demo: { backgroundColor: '#FFB0A4', borderColor: '#B73D44', alignSelf: 'stretch', alignItems: 'center' },
});
