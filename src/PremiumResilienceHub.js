import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React, { useEffect, useMemo, useState } from 'react';
import { BackHandler, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text, TextInput } from "./Privacy";
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_PREMIUM_STATE, buildBillShockPlans, buildCatchUpPlan, roundUpForPurchase, unpaidPremiumBills } from './premium-resilience.mjs';
import { SAMPLE_FINANCE, SAMPLE_PURCHASES, normalizePremiumBeta, premiumAmount, simulatePayday, simulateRoundup } from './premium-beta.mjs';
import { HowItWorks, PREMIUM_HELP } from './ScreenHelp';
import BobbieBankDemoLogin from './BobbieBankDemoLogin';
import BankWelcomeCard from './BankWelcomeCard';
import { CategoryEntry } from './MerchantCategories';
import { bankSpending, recurringCandidates } from './bank-activity.mjs';

const bobbie = require('../assets/characters/premium-bobbie-gala.png');
import { payplaceLogo, payplaceLogoLabel } from './brand';
const featureColors=['#65EBEF','#FFE455','#FFB0A4','#DCABFF'];
const FEATURES = [
  { id: 'roundup', title: 'Round Up & Save', body: 'Small change. Bigger breathing room.', image: require('../assets/characters/premium-roundup.png'), badge: 'Sample automation' },
  { id: 'fund', title: 'Life Happens Fund', body: 'A cushion for the stuff nobody planned.', image: require('../assets/characters/premium-fund.png'), badge: 'Sample automation' },
  { id: 'shock', title: 'Bill Shock Mode', body: 'An unexpected expense. A gentler recovery plan.', image: require('../assets/characters/premium-shock.png'), badge: 'Try with your budget' },
  { id: 'catchup', title: 'Help, I’m Falling Behind', body: 'You do not need a lecture. You need a plan.', image: require('../assets/characters/premium-catchup.png'), badge: 'Try with your bills' },
  { id: 'watch', title: 'Automatic Money Watch', body: 'Investigate bills, subscriptions and debt changes.', image: require('../assets/characters/premium-watch.png'), badge: 'Sample monitoring' },
  { id: 'credit', title: 'Credit Center', body: 'A calmer place to understand your credit.', image: require('../assets/characters/premium-credit.png'), badge: 'Sample score' },
];
const dollars = value => `$${Number(value || 0).toFixed(2)}`;
function Button({ label, onPress, secondary = false, disabled = false }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.button, secondary && s.secondary, disabled && s.disabled]}><Text style={[s.buttonText, secondary && s.secondaryText]}>{label}</Text></TouchableOpacity>;
}
function Field({ label, value, onChangeText }) {
  return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} keyboardType="decimal-pad" style={s.input} /></View>;
}
function Toggle({ label, value, onChange }) {
  return <View style={s.row}><Text style={s.rowTitle}>{label}</Text><Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ false: '#CBD5E1', true: '#087E76' }} /></View>;
}
function Box({ title, children }) {
  return <View style={s.box}><Text accessibilityRole="header" style={s.panelTitle}>{title}</Text>{children}</View>;
}

export default function PremiumResilienceHub({ visible = true, embedded = false, onClose, finance = {}, premiumState = DEFAULT_PREMIUM_STATE, onPremiumStateChange = () => {}, betaState, onBetaStateChange = () => {}, onOpenBankConnections, onOpenCategories, onBankAction, onOpenSubscriptions, onOpenBills, onStartDemo, onCreditChange, initialPanel = null }) {
  const [panel, setPanel] = useState(initialPanel);
  const [notice, setNotice] = useState('');
  const [shockAmount, setShockAmount] = useState('');
  const [cap, setCap] = useState(String(premiumState.roundUpCap));
  const [target, setTarget] = useState(String(premiumState.lifeHappensTarget));
  const [contribution, setContribution] = useState(String(premiumState.paydayContribution));
  const beta = useMemo(() => normalizePremiumBeta(betaState), [betaState]);
  const feature = FEATURES.find(item => item.id === panel);
  const sharedBank = finance.bankActivity?.source === 'demo' && !!onBankAction;
  const spending = useMemo(() => bankSpending(finance), [finance.categorization]);
  const clues = useMemo(() => recurringCandidates(finance, new Date(), true), [finance.categorization, finance.subscriptionDetection]);
  const planFinance = sharedBank ? finance : beta.useSamplePlan ? SAMPLE_FINANCE : finance;
  const bills = useMemo(() => unpaidPremiumBills(planFinance.bills), [planFinance.bills]);
  const fundBalance = beta.useSamplePlan ? beta.sampleFund : premiumState.lifeHappensBalance;
  const catchUp = useMemo(() => buildCatchUpPlan({ bills, availableCash: planFinance.balance, nextIncome: planFinance.nextPaycheck }), [bills, planFinance.balance, planFinance.nextPaycheck]);
  const expense = premiumAmount(shockAmount);
  const shock = buildBillShockPlans({ expense: expense ?? 0, balance: planFinance.balance, nextIncome: planFinance.nextPaycheck,
    upcomingEssentialBills: bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0), lifeHappensBalance: fundBalance });
  useEffect(() => { setPanel(initialPanel); }, [initialPanel]);
  useEffect(() => { setCap(String(premiumState.roundUpCap)); }, [premiumState.roundUpCap]);
  useEffect(() => { setTarget(String(premiumState.lifeHappensTarget)); setContribution(String(premiumState.paydayContribution)); }, [premiumState.lifeHappensTarget, premiumState.paydayContribution]);
  useEffect(() => {
    if (!visible || !panel) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { setPanel(null); setNotice(''); return true; });
    return () => listener.remove();
  }, [panel, visible]);
  function open(id) { setPanel(id); setNotice(''); }
  function updateBeta(patch) { onBetaStateChange({ ...beta, ...patch }); }
  function saveRoundup() {
    const parsed = premiumAmount(cap);
    if (parsed === null) { setNotice('Enter a valid cap with up to two decimal places.'); return; }
    onPremiumStateChange({ ...premiumState, roundUpCap: parsed }); setNotice('Round-up preferences saved. Live transfers are not enabled.');
  }
  function saveFund() {
    const goal = premiumAmount(target); const payday = premiumAmount(contribution);
    if (goal === null || goal <= 0 || payday === null) { setNotice('Enter a target above zero and a valid payday contribution.'); return; }
    onPremiumStateChange({ ...premiumState, lifeHappensTarget: goal, paydayContribution: payday }); setNotice('Fund preferences saved. Live transfers are not enabled.');
  }
  const sampleReady = beta.sampleConnected;
  function connectSamples() { updateBeta({ sampleConnected: true }); setNotice('Fictional accounts connected. You can keep testing on this screen. No bank login or money movement occurred.'); }
  const sampleHelp = <><Text style={s.body}>Connect fictional accounts to unlock this sample feature. No bank login or credit inquiry is needed.</Text><Button label="Connect sample accounts" onPress={connectSamples} /></>;
  const roundUpBlock = !sampleReady ? 'First connect sample accounts below to unlock the purchase simulation.' : !beta.roundUpEnabled ? 'Sample round-ups are paused. Turn them on to try a purchase batch.' : premiumState.roundUpCap <= 0 ? 'Your saved weekly cap is $0. Set a cap above zero and tap Save round-up cap.' : beta.roundUpSaved >= premiumState.roundUpCap ? 'You have reached your saved weekly cap. Start a new sample week below, or save a higher cap.' : '';
  const fundBlock = !sampleReady ? 'First connect sample accounts below to unlock the payday simulation.' : !beta.fundEnabled ? 'Sample payday savings are paused. Turn them on to try a payday.' : beta.sampleFund >= premiumState.lifeHappensTarget ? 'Your sample fund has reached its target. Try a sample emergency below, or save a higher target.' : premiumState.paydayContribution <= 0 ? 'Your saved contribution is $0. Enter an amount above zero and tap Save fund preferences.' : '';
  const content = <View style={s.page}>
    {panel && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to Plaid Banking" onPress={() => open(null)} style={s.back}><Ionicons name="arrow-back" size={20} color="#6754E8" /><Text style={s.backText}>Back to Plaid Banking</Text></TouchableOpacity>}
    <ScrollView key={panel || 'hub'} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    {panel && <View style={s.header}>
      <View style={s.headerCopy}><Image source={payplaceLogo} style={{ width: 30, height: 30 }} resizeMode="contain" accessibilityLabel={payplaceLogoLabel} /><Text style={s.kicker}>PLAID BANKING</Text><Text style={s.title}>{feature ? feature.title : panel === 'accounts' ? 'Account connections' : panel === 'demo' ? 'Bobbie’s banking demo' : 'Your neighborhood bank.'}</Text><Text style={s.subtitle}>{feature ? feature.body : 'Accounts, savings, monitoring and credit in one place.'}</Text></View>
      <Image source={bobbie} style={s.bobbie} resizeMode="contain" accessibilityLabel="Bobbie in her diamond tiara, colorful PayPlace princess gala gown and jewels" />
    </View>}
      {panel && !feature && <View style={s.promise}><Text style={s.promiseTitle}>Paid Premium · free sample demo</Text><Text style={s.body}>Plaid linking and subscription tracking are paid Premium features. Explore them with fictional demo data, or enter your own information in Bills and Budget.</Text></View>}
      {panel && <HowItWorks guide={PREMIUM_HELP[panel]} />}
      {panel === 'demo' && (sharedBank ? <Box title="Demo banking data is already loaded"><Text style={s.body}>Your sample accounts and transactions are already loaded for this demo session. You don’t need to import them again.</Text><Button label="View demo accounts" onPress={()=>open('accounts')}/>{onOpenCategories&&<Button label="View demo transactions" onPress={onOpenCategories}/>}</Box> : <BobbieBankDemoLogin onConnect={onStartDemo || (() => {updateBeta({sampleConnected:true,useSamplePlan:true});open(null);})} />)}
      {notice && !['roundup', 'fund', 'watch', 'credit'].includes(panel) ? <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text> : null}
      {!panel && <>
        <BankWelcomeCard demoConnected={sharedBank} demoLabel={sharedBank?'View connected demo accounts':'Try Bobbie’s banking demo'} onDemo={() => open(sharedBank?'accounts':'demo')} />
        {onOpenBills && <Button secondary label="Enter my bills manually" onPress={onOpenBills} />}
        {sharedBank && <Box title="Your demo accounts"><Text accessibilityLiveRegion="polite" style={s.body}>Demo data loaded. Your sample transactions are already in the app; no repeat import is needed.</Text><Text style={s.body}>Checking {dollars(finance.balance)} · Savings {dollars(beta.sampleFund)}</Text><Text style={s.body}>{finance.categorization.transactions.length} transactions feed categories, spending totals, round-ups and Subscription Detective. All money is fictional.</Text></Box>}
        {onOpenCategories && <CategoryEntry onOpen={onOpenCategories} />}
        <Box title="Accounts"><Text style={s.body}>Sample accounts, provider availability and connection controls live here. Everything below uses these same banking settings.</Text><Text style={s.badge}>{sampleReady ? 'SAMPLE ACCOUNTS CONNECTED' : 'SAMPLE ACCOUNTS NOT CONNECTED YET'}</Text><Button secondary label="Account connections & beta setup" onPress={() => open('accounts')} /></Box>
        {FEATURES.map((item, index) => <React.Fragment key={item.id}>{index === 0 && <Text style={s.panelTitle}>Savings & automation</Text>}{index === 2 && <Text style={s.panelTitle}>Recovery plans</Text>}{index === 4 && <Text style={s.panelTitle}>Monitoring & credit</Text>} <TouchableOpacity artworkMode="integrated" key={item.id} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={() => open(item.id)} style={[s.card,{backgroundColor:featureColors[index%featureColors.length]}]}>
          <Image source={item.image} style={s.cardArt} resizeMode="contain" accessible={false} /><View style={s.cardCopy}><Text style={s.badge}>{item.badge}</Text><Text style={s.cardTitle}>{item.title}</Text><Text style={s.body}>{item.body}</Text></View><Ionicons name="chevron-forward" size={18} color="#6754E8" />
        </TouchableOpacity></React.Fragment>)}
      </>}
      {panel === 'accounts' && <>
        {!sampleReady && <BobbieBankDemoLogin onConnect={() => { updateBeta({ sampleConnected: true, useSamplePlan: true }); setNotice('Bobbie’s fictional checking and savings accounts are connected. Explore every demo feature from Plaid Banking.'); }} />}
        <Box title="Try the sample neighborhood bank"><Text style={s.body}>Connect fictional checking and savings accounts to test the controls. These local sample accounts are separate from your real finances.</Text><Text style={s.value}>{sampleReady ? 'Sample accounts connected' : 'Sample accounts disconnected'}</Text>
          {sampleReady && <><Text style={s.body}>Sample checking: {dollars(sharedBank ? finance.balance : 320)} · Sample savings: {dollars(beta.sampleFund)}</Text><Button secondary label="Disconnect sample accounts" onPress={() => { updateBeta({ sampleConnected: false, roundUpEnabled: false, fundEnabled: false }); setNotice('Sample accounts disconnected. Sample automation is paused.'); }} /></>}
          {!sampleReady && <Button label="Connect sample accounts" onPress={() => { updateBeta({ sampleConnected: true }); setNotice('Fictional accounts connected for beta testing.'); }} />}
        </Box>
        <Box title="Real banking"><Text style={s.body}>Provider eligibility and pricing are being evaluated. Live bank linking, transfers, credit data and bill payments will require approved integrations.</Text>{onOpenBankConnections && <Button secondary label="View live bank-linking availability" onPress={onOpenBankConnections} />}</Box>
        <Button secondary label={sharedBank?"Reset demo banking data":"Reset sample activity"} onPress={() => { if (sharedBank) onBankAction({ type: 'reset' }); else onBetaStateChange(normalizePremiumBeta(null)); setNotice('Sample activity reset. Your personal plan is unchanged.'); }} />
      </>}
      {panel === 'roundup' && <>
        <Box title="Your round-up preferences"><Toggle label="Enable sample round-ups" value={beta.roundUpEnabled} onChange={value => { updateBeta({ roundUpEnabled: value }); setNotice(value ? 'Sample round-ups enabled. No live transfer is authorized.' : 'Sample round-ups paused.'); }} />
          <Text style={s.label}>Round-up multiplier</Text><View style={s.choices}>{[1, 2, 3].map(value => <TouchableOpacity accessibilityRole="radio" accessibilityLabel={`Round-up multiplier ${value} times`} accessibilityState={{ selected: premiumState.roundUpMultiplier === value }} key={value} style={[s.choice, premiumState.roundUpMultiplier === value && s.selected]} onPress={() => onPremiumStateChange({ ...premiumState, roundUpMultiplier: value })}><Text style={[s.choiceText, premiumState.roundUpMultiplier === value && { color: '#FFFFFF' }]}>{value}×</Text></TouchableOpacity>)}</View>
          <Field label="Weekly round-up cap ($)" value={cap} onChangeText={setCap} /><Button label="Save round-up cap" onPress={saveRoundup} />
        </Box>
        <Box title="Sample purchase preview">{SAMPLE_PURCHASES.map(amount => <View style={s.row} key={amount}><Text style={s.rowTitle}>Purchase {dollars(amount)}</Text><Text style={s.rowValue}>+{dollars(roundUpForPurchase(amount, premiumState.roundUpMultiplier))}</Text></View>)}<Text style={s.body}>The saved cap limits the batch total. Each tap simulates a new batch in the same sample week.</Text><View style={s.savingsTotal}>
            <Text style={s.savingsLabel}>Sample savings this week</Text>
            <Text accessibilityLabel={`${dollars(beta.roundUpSaved)} sample savings this week`} accessibilityLiveRegion="polite" style={s.savingsAmount}>{dollars(beta.roundUpSaved)}</Text>
            <Text style={s.savingsHelp}>{beta.roundUpSaved === 0 ? 'Your sample total starts at $0. ' : ''}Tap “Simulate next purchase batch” below to add sample round-ups to this total. The purchase preview above does not add savings by itself.</Text>
          </View>
          <Text style={s.body}>Preview uses your saved {premiumState.roundUpMultiplier}× multiplier and {dollars(premiumState.roundUpCap)} weekly cap. Changing the cap field takes effect after you save it.</Text>
          {!!roundUpBlock && <Text accessibilityLiveRegion="polite" style={s.notice}>{roundUpBlock}</Text>}
          {!sampleReady ? sampleHelp : !beta.roundUpEnabled && <Button secondary label="Turn on sample round-ups" onPress={() => { updateBeta({ roundUpEnabled: true }); setNotice('Sample round-ups enabled. Try the purchase batch below.'); }} />}
          <Button label="Simulate next purchase batch" disabled={!!roundUpBlock} onPress={() => { if (sharedBank) { if (onBankAction({ type: 'purchase-batch' })) setNotice('New purchases entered the shared demo feed. Checking, categories and round-up savings updated together.'); } else { const result = simulateRoundup(beta, premiumState); onBetaStateChange(result.state); setNotice(`${dollars(result.added)} added to sample savings. No money moved.`); } }} />
          {sharedBank && <Text style={s.body}>Demo checking now: {dollars(finance.balance)}. Savings now: {dollars(beta.sampleFund)}. Previously processed purchases never round up twice.</Text>}
          {!!notice && <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text>}
          <Button secondary label="Start a new sample week" onPress={() => { if (sharedBank) onBankAction({ type: 'next-week' }); else updateBeta({ roundUpSaved: 0, roundupRuns: 0 }); setNotice('A new sample week is ready. Your saved savings balance stays intact.'); }} />
        </Box>
      </>}
      {panel === 'fund' && <>
        <Box title="Build your cushion"><Field label="Life Happens target ($)" value={target} onChangeText={setTarget} /><Field label="Contribution per payday ($)" value={contribution} onChangeText={setContribution} /><Button label="Save fund preferences" onPress={saveFund} /><Toggle label="Enable sample payday savings" value={beta.fundEnabled} onChange={value => { updateBeta({ fundEnabled: value }); setNotice(value ? 'Sample payday savings enabled.' : 'Sample payday savings paused.'); }} /></Box>
        <Box title="Your sample fund"><Text style={s.value}>{dollars(beta.sampleFund)}</Text><Text style={s.body}>Sample balance · saved target {dollars(premiumState.lifeHappensTarget)} · saved contribution {dollars(premiumState.paydayContribution)} per payday. Your saved real-life cushion is {dollars(premiumState.lifeHappensBalance)}; this simulation never changes it.</Text>
          {!!fundBlock && <Text accessibilityLiveRegion="polite" style={s.notice}>{fundBlock}</Text>}
          {!sampleReady ? sampleHelp : !beta.fundEnabled && <Button secondary label="Turn on sample payday savings" onPress={() => { updateBeta({ fundEnabled: true }); setNotice('Sample payday savings enabled. Try the payday below.'); }} />}
          <Button label="Simulate next payday" disabled={!!fundBlock} onPress={() => { if (sharedBank) { if (onBankAction({ type: 'payday' })) setNotice('Payday entered the shared demo feed. Checking and your saved payday contribution updated together.'); } else { const result = simulatePayday(beta, premiumState); onBetaStateChange(result.state); setNotice(`${dollars(result.added)} added to your sample fund. No money moved.`); } }} />
          {sampleReady && beta.sampleFund <= 0 && <Text style={s.body}>The sample fund is empty. Add sample payday savings before trying an emergency.</Text>}
          <Button secondary label="Simulate a $50 emergency" disabled={!sampleReady || beta.sampleFund <= 0} onPress={() => { const used = Math.min(50, beta.sampleFund); if (sharedBank) onBankAction({ type: 'emergency' }); else updateBeta({ sampleFund: beta.sampleFund - used }); setNotice(`Your sample cushion covered ${dollars(used)}. Try another sample payday to rebuild it.`); }} />{!!notice && <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text>}</Box>
      </>}
      {(panel === 'shock' || panel === 'catchup') && <Box title="Choose your planning data"><Toggle label="Use sample budget for this plan" value={beta.useSamplePlan} onChange={value => { updateBeta({ useSamplePlan: value }); setNotice('Planning data changed. No saved bills or balances were changed.'); }} /><Text style={s.body}>{beta.useSamplePlan ? 'Using a fictional budget and bills.' : 'Using your saved balance and unpaid bills. Entries may need updating.'} Cash now: {dollars(planFinance.balance)}. Next paycheck estimate: {dollars(planFinance.nextPaycheck)}.</Text></Box>}
      {panel === 'shock' && <>
        <Box title="What happened?"><Field label="Unexpected expense ($)" value={shockAmount} onChangeText={setShockAmount} /><Text style={s.body}>Unpaid bills are reserved first. An expected paycheck is not cash available today. These estimates do not create a loan, payment agreement or transfer.</Text></Box>
        {expense !== null && expense > 0 && <Box title="Choose a recovery plan"><Text style={s.body}>Cushion available for this expense: {dollars(shock.useFund.fundUse)}.</Text>
          {['fastest', 'balanced', 'gentlest'].map(choice => <View key={choice} style={s.plan}><Text style={s.cardTitle}>{shock[choice].label}</Text><Text style={s.body}>{choice === 'fastest' ? `${dollars(shock.fastest.payNow)} could be covered now; ${dollars(shock.fastest.remaining)} remains.` : choice === 'balanced' ? `${shock.balanced.periods} estimated future contributions around ${dollars(shock.balanced.payment)}, after the cushion and current cash.` : `${dollars(shock.gentlest.suggestedWeekly)} weekly starting estimate; reserves more of your cushion. Review against your future budget.`}</Text><Button secondary label={`Save ${shock[choice].label} recovery plan`} onPress={() => { updateBeta({ savedRecovery: { choice, expense } }); setNotice('Recovery choice saved for beta review. No payment has been scheduled.'); }} /></View>)}
        </Box>}
        {shockAmount && expense === null && <Text style={s.notice}>Enter a valid expense with up to two decimal places.</Text>}
        {beta.savedRecovery && <Text style={s.body}>Saved beta choice: {beta.savedRecovery.choice} · expense {dollars(beta.savedRecovery.expense)}. Recalculate after your budget changes.</Text>}
      </>}
      {panel === 'catchup' && <Box title="One step at a time"><Text style={s.quote}>You do not need a lecture. You need a plan.</Text><Text style={s.body}>Estimates include your next paycheck. Check each due date and discuss partial payments with the provider; these are planning amounts, not payments.</Text><Text style={s.value}>{dollars(catchUp.totalShortfall)} remaining shortfall</Text>{catchUp.steps.length ? catchUp.steps.map(step => <View key={step.id} style={s.plan}><Text style={s.cardTitle}>{step.name || step.title || 'Bill'}{step.overdue ? ' · overdue' : ''}</Text><Text style={s.body}>Owed {dollars(step.amount)} · planned {dollars(step.recommendedPayment)} · shortfall {dollars(step.shortfall)}</Text></View>) : <Text style={s.body}>No unpaid bills saved. Add your bills or switch on the sample budget above to try a catch-up plan.</Text>}{onOpenBills && <Button label="Review my bills" onPress={onOpenBills} />}</Box>}
      {panel === 'watch' && <>
        {sharedBank ? <>
          <Box title="Money Watch · from your demo transactions"><Text style={s.body}>These findings are calculated from the same fictional transactions you categorize. Last checked: {finance.bankActivity.checkedAt.slice(0, 10)}.</Text>
            {clues.map(c => <View key={c.key} style={s.plan}><Text style={s.cardTitle}>{c.name} · {dollars(c.amountCents / 100)} · {c.frequency}</Text><Text style={s.body}>{c.count} settled charges · estimated next charge {c.renewalDate}</Text>{c.priceChangeCents !== 0 && <Text style={s.body}>Price {c.priceChangeCents > 0 ? 'increase' : 'decrease'}: {dollars(Math.abs(c.priceChangeCents) / 100)}. Review this charge in Subscription Detective.</Text>}</View>)}
            {!clues.length && <Text style={s.body}>No recurring patterns in the available history.</Text>}
            <Button label="Refresh sample watch feed" onPress={() => { if (onBankAction({ type: 'refresh' })) setNotice('Rechecked the shared transaction history. No invented charges or duplicate round-ups.'); }}/>{!!notice && <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text>}
          </Box>
          <Box title="Spending by your categories">{spending.map(item => <View key={item.category} style={s.row}><Text style={s.rowTitle}>{item.category}</Text><Text style={s.rowValue}>{dollars(item.amountCents / 100)}</Text></View>)}<Text style={s.body}>All available settled expense history. Pending charges, transfers and income are excluded. Refunds appear in the purchase list and are excluded from these gross spending totals.</Text></Box>
        </> : <>
        <Box title="Sample money-watch feed"><Text style={s.body}>Fictional examples of what automated monitoring could highlight. Your accounts are not being scanned.</Text>{sampleReady ? <><Text style={s.cardTitle}>Sample subscription renewal · $14.99</Text><Text style={s.body}>A sample streaming renewal is approaching. Review whether it still fits.</Text><Text style={s.cardTitle}>Sample utility change · +$12.00</Text><Text style={s.body}>An example bill increase to review before the next payday.</Text><Button label="Refresh sample watch feed" onPress={() => { updateBeta({ watchRefreshes: beta.watchRefreshes + 1 }); setNotice('Sample feed refreshed. No live bank scan occurred.'); }} /><Text style={s.body}>Sample refreshes: {beta.watchRefreshes}</Text>{!!notice && <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text>}</> : sampleHelp}</Box>
        </>}
        <Box title="Your Subscription Detective"><Text style={s.body}>Subscription Detective is a paid Premium feature. The sample demo shows how it finds recurring charges and estimates renewal dates. Enter real subscription expenses as bills in regular PayPlace.</Text>{onOpenSubscriptions && <Button label="Open Subscription Detective" onPress={onOpenSubscriptions} />}</Box>
      </>}
      {panel === 'credit' && <>
        <Box title="Sample credit dashboard"><Text style={s.badge}>FICTIONAL SCORE · BETA ONLY</Text><Text style={s.score}>{sampleReady ? beta.creditRefreshes % 2 ? '716' : '712' : '—'}</Text><Text style={s.body}>This is a fictional score on a sample 300–850 scale. No bureau report, identity verification or credit check has been requested.</Text>{sampleReady ? <><Text style={s.body}>Sample factors: payment history, balances and account age. Live bureau, score model and refresh schedule are still to be determined.</Text><Button label="Refresh sample credit score" onPress={() => { updateBeta({ creditRefreshes: beta.creditRefreshes + 1 }); setNotice('Fictional score refreshed. Your credit was not checked.'); }} />{!!notice && <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text>}</> : sampleHelp}</Box>
        <Box title="Your saved credit entry">{onCreditChange && <><Text style={s.label}>Current credit score</Text><TextInput accessibilityLabel="Current credit score" value={String(finance.creditScore || '')} onChangeText={onCreditChange} keyboardType="number-pad" style={s.input}/></>}<Text style={s.value}>{Number(finance.creditScore) >= 300 && Number(finance.creditScore) <= 850 ? finance.creditScore : 'No score saved'}</Text><Text style={s.body}>Your manually entered record, separate from the fictional score above. It has not been verified by a credit bureau.</Text></Box>
      </>}
      {feature && <><Text style={s.body}>Beta practice only. This beta does not move money, pay bills or retrieve credit reports.</Text><Image source={feature.image} style={s.featureArt} resizeMode="contain" accessibilityLabel={`${feature.title} original PayPlace illustration`} /></>}
    </ScrollView>
    {!embedded && <Button secondary label="Close Plaid Banking" onPress={onClose} />}
  </View>;
  return embedded ? content : <Modal visible={visible} animationType="slide" onRequestClose={panel ? () => open(null) : onClose}><SafeAreaView style={s.page}>{content}</SafeAreaView></Modal>;
}

const s = StyleSheet.create({
  savingsTotal: { padding: 16, gap: 8, borderRadius: 16, backgroundColor: '#DFFCF7', borderWidth: 2, borderColor: '#13B8A6' },
  savingsLabel: { color: '#46349D', fontSize: 14, fontWeight: '900' },
  savingsAmount: { color: '#087E76', fontSize: 32, fontWeight: '900' },
  savingsHelp: { color: '#075E54', fontSize: 14, lineHeight: 21 },
  page: { flex: 1, backgroundColor: '#F6FBFF' }, header: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8, borderRadius: 18, flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EEE9FF' }, headerCopy: { flex: 1, paddingTop: 8 }, bobbie: { width: 84, height: 112, marginLeft: 6 }, kicker: { fontSize: 11, fontWeight: '900', color: '#6754E8', letterSpacing: 1 }, title: { fontSize: 21, lineHeight: 26, fontWeight: '900', color: '#071A3A', marginTop: 7 }, subtitle: { fontSize: 13, lineHeight: 19, color: '#536178', marginTop: 7 }, content: { padding: 16, gap: 12, paddingBottom: 30 }, promise: { backgroundColor: '#DFFCF7', borderRadius: 18, padding: 15 }, promiseTitle: { fontSize: 15, fontWeight: '900', color: '#075E54' }, card: { minHeight: 164, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, borderRadius: 28, padding: 12, borderWidth: 3, borderColor: '#9F3DE5' }, cardArt: { width: 128, height: 128, borderRadius: 18 }, cardCopy: { flexGrow: 1, flexShrink: 1, flexBasis: 110, minWidth: 0 }, cardTitle: { fontSize: 21, lineHeight: 27, fontWeight: '900', color: '#071A3A' }, badge: { fontSize: 10, lineHeight: 15, fontWeight: '900', color: '#4D186E', marginBottom: 3 }, body: { fontSize: 14, lineHeight: 21, color: '#173C50', marginTop: 4 }, back: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 12, alignItems: 'center' }, backText: { color: '#6754E8', fontWeight: '800' }, box: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 17, gap: 10 }, panelTitle: { fontSize: 20, fontWeight: '900', color: '#071A3A' }, quote: { fontSize: 17, lineHeight: 24, fontWeight: '800', color: '#6754E8' }, featureArt: { width: '100%', height: 130, borderRadius: 18 }, field: { gap: 6 }, label: { fontSize: 14, color: '#334660', fontWeight: '800' }, input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 13, padding: 13, fontSize: 17, backgroundColor: '#FFFFFF' }, button: { backgroundColor: '#6754E8', padding: 14, borderRadius: 13, alignItems: 'center', justifyContent: 'center', minHeight: 46 }, buttonText: { color: '#FFFFFF', fontWeight: '900', textAlign: 'center' }, secondary: { backgroundColor: '#EEE9FF' }, secondaryText: { color: '#46349D' }, disabled: { opacity: 0.45 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, rowTitle: { flex: 1, color: '#334660', fontWeight: '700' }, rowValue: { color: '#071A3A', fontWeight: '900' }, value: { fontSize: 22, color: '#071A3A', fontWeight: '900' }, choices: { flexDirection: 'row', gap: 10 }, choice: { padding: 12, borderRadius: 12, backgroundColor: '#EEE9FF', minWidth: 55, alignItems: 'center' }, selected: { backgroundColor: '#6754E8' }, choiceText: { fontWeight: '900', color: '#46349D' }, notice: { padding: 12, borderRadius: 12, color: '#075E54', backgroundColor: '#DFFCF7', fontSize: 14, lineHeight: 21 }, plan: { borderTopWidth: 1, borderColor: '#E4DDF7', paddingTop: 12, gap: 8 }, score: { fontSize: 58, fontWeight: '900', color: '#6754E8', textAlign: 'center' },
});
