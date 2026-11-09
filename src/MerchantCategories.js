import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from './Privacy';
import FittedArtwork from './FittedArtwork';
import { CATEGORY_CHOICES, categoryAction, categoryAmountCents, categoryState, purchaseCategory } from './merchant-categories.mjs';

const art = {
  Shopping: require('../assets/categories/bobbie-shopping.jpg'),
  Clothing: require('../assets/categories/bobbie-clothing.jpg'),
  Groceries: require('../assets/categories/daddy-groceries.jpg'),
  Household: require('../assets/categories/household.jpg'),
  Dining: require('../assets/categories/dining.jpg'),
  Transportation: require('../assets/categories/transportation.jpg'),
  Health: require('../assets/categories/health.jpg'),
  Pets: require('../assets/categories/pets.jpg'),
  Entertainment: require('../assets/categories/entertainment.jpg'),
  Other: require('../assets/categories/other.jpg'),
};
const colors = ['#7842D2', '#FF8479', '#14C8BD', '#FFE34F'];
const ink = '#132547';
const dollars = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const newId = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const today = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };
function Button({ title, onPress, selected, disabled, artworkAction, color = '#7842D2', label, ...props }) {
  return <TouchableOpacity {...props} artworkAction={artworkAction} accessibilityRole="button" accessibilityLabel={label || title}
    accessibilityState={{ selected: !!selected, disabled: !!disabled }} disabled={disabled} onPress={onPress}
    style={[s.button, { backgroundColor: color }, selected && s.selected, disabled && { opacity: 0.5 }]}>
    <Text style={[s.buttonText, { color: color === '#7842D2' ? 'white' : ink }]}>{selected ? '✓ ' : ''}{title}</Text>
  </TouchableOpacity>;
}
function CategoryTiles({ selected, onSelect, customCategories = [] }) {
  const [expanded, setExpanded] = useState(false);
  const choices = [...CATEGORY_CHOICES, ...customCategories.filter(c => !CATEGORY_CHOICES.includes(c))];
  return <><View style={s.tiles}>
    {choices.filter((category, i) => i < 4 || expanded || category === selected).map(category => { const index = choices.indexOf(category); return <TouchableOpacity artworkMode="integrated"
      key={category} accessibilityRole="button" accessibilityLabel={`Choose ${category}`} accessibilityState={{ selected: category === selected }}
      onPress={() => onSelect(category)} style={[s.tile, { backgroundColor: colors[index % colors.length] }, selected === category && s.selected]}>
      <FittedArtwork source={art[category] || art.Other} aspectRatio={1} accessible={false} />
      <Text style={[s.tileText, { color: index % 4 === 0 ? 'white' : ink }]}>{category === selected ? '✓ ' : ''}{category}</Text>
    </TouchableOpacity>; })}
  </View><Button title={expanded ? 'Fewer categories' : 'Choose another category'} color="#FFE34F" onPress={() => setExpanded(!expanded)}/></>;
}
export function CategoryEntry({ onOpen }) {
  return <TouchableOpacity artworkMode="integrated" accessibilityRole="button" accessibilityLabel="Open purchases and remembered categories" onPress={onOpen} style={s.entry}>
    <View style={s.preview}>{['Shopping', 'Clothing', 'Groceries'].map((name, i) => <View key={name} style={[s.previewTile, { backgroundColor: colors[i] }]}>
      <FittedArtwork source={art[name]} aspectRatio={1} accessible={false}/><Text style={[s.previewLabel, { color: i === 0 ? 'white' : ink }]}>{name}</Text>
    </View>)}</View>
    <Text style={s.title}>Your purchases. Your categories.</Text>
    <Text style={s.body}>Fix it once. Let PayPlace remember.</Text>
    <Text style={s.entryLink}>Choose my categories →</Text>
  </TouchableOpacity>;
}
export default function MerchantCategories({ visible, onClose, value, onChange, sample = false }) {
  const state = categoryState(value);
  const [page, setPage] = useState('purchases'), [draft, setDraft] = useState(null);
  const [accountFilter, setAccountFilter] = useState(null), [newAccount, setNewAccount] = useState('');
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [undo, setUndo] = useState(null);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const accountName = id => state.accounts.find(a => a.id === id)?.name || 'Account';
  const customCategories = [...new Set([...state.rules.map(r => r.category), ...state.overrides.flatMap(o => o.splits ? o.splits.map(p => p.category) : [o.category])])];
  function openPurchase(transaction) {
    const chosen = transaction && purchaseCategory(state, transaction);
    setDraft(transaction ? { ...transaction, isNew: false, amount: (transaction.amountCents / 100).toFixed(2),
      category: chosen.splits ? 'Groceries' : chosen.category === 'Uncategorized' ? '' : chosen.category,
      splits: chosen.splits?.map(p => ({ category: p.category, amount: (p.amountCents / 100).toFixed(2) })), scope: 'once', includePast: false }
      : { id: newId('purchase'), isNew: true, merchant: '', accountId: accountFilter || state.accounts[0].id, amount: '', date: today(), category: '', scope: 'account', includePast: false });
    setError(''); setNotice('');
  }
  async function commit(next, message) {
    await onChange(next);
    setUndo(state); setNotice(message); setError('');
  }
  async function act(action, message) {
    if (saving.current) return;
    saving.current = true; setBusy(true);
    try { await commit(categoryAction(state, action), message); return true; }
    catch (e) { setError(e.message); return false; }
    finally { saving.current = false; setBusy(false); }
  }
  async function save() {
    if (saving.current) return;
    saving.current = true; setBusy(true);
    try {
      let next = state;
      if (draft.ruleId) {
        next = categoryAction(state, { type: 'edit-rule', id: draft.ruleId, category: draft.category });
      } else {
        if (draft.isNew) next = categoryAction(next, { type: 'add-purchase', purchase: { id: draft.id, merchant: draft.merchant, accountId: draft.accountId, amountCents: categoryAmountCents(draft.amount), date: draft.date } });
        next = categoryAction(next, { type: 'categorize', id: draft.id, category: draft.category, scope: draft.splits ? 'once' : draft.scope, includePast: draft.includePast,
          ...(draft.splits ? { splits: draft.splits.map(p => ({ category: p.category, amountCents: categoryAmountCents(p.amount) })) } : {}) });
      }
      await commit(next, draft.splits ? 'Purchase split. Every cent has a place.' : draft.ruleId || draft.scope !== 'once' ? `Got it! ${draft.merchant} → ${draft.category} from now on.` : `This purchase goes in ${draft.category}.`);
      setDraft(null);
    } catch (e) { setError(e.message); }
    finally { saving.current = false; setBusy(false); }
  }
  const change = patch => { setDraft(current => ({ ...current, ...patch })); setError(''); };
  const purchases = state.transactions.filter(t => !accountFilter || t.accountId === accountFilter).slice().reverse();
  return <Modal visible={visible} animationType="slide" onRequestClose={() => { if (!busy) { if (draft) setDraft(null); else onClose(); } }}>
    <KeyboardAvoidingView style={s.surface} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView style={s.surface} contentContainerStyle={s.page} keyboardShouldPersistTaps="handled" pointerEvents={busy ? 'none' : 'auto'}>
      <Button title={draft ? '← My categories' : '← Back to my neighborhood'} disabled={busy} onPress={() => { if (draft) setDraft(null); else { setUndo(null); onClose(); } }} color="#FFE34F"/>
      <Text accessibilityRole="header" style={s.title}>{draft ? draft.ruleId ? `Remember ${draft.merchant}` : 'Where does this belong?' : 'Your purchases. Your categories.'}</Text>
      <Text style={s.body}>{sample ? 'Sample plan · These choices stay in the demo.' : 'Your choices stay on this device and travel with your encrypted backup.'}</Text>
      {!draft && <Text style={s.note}>Add purchases manually today. Bank transaction imports are still to come. These records organize purchases; they do not subtract from your balance.</Text>}
      {error && !draft ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
      {notice ? <View accessibilityLiveRegion="polite" style={s.notice}><Text style={s.body}>{notice}</Text>{undo && <Button title="Undo" color="#14C8BD" onPress={async () => { if (saving.current) return; saving.current = true; setBusy(true); try { await onChange(undo); setUndo(null); setNotice('That change has been undone.'); } catch (e) { setError(e.message); } finally { saving.current = false; setBusy(false); } }}/>}</View> : null}
      {draft ? <>
        {!draft.ruleId && <View style={s.card}>
          <Text style={s.label}>{draft.isNew ? 'Merchant' : draft.merchant}</Text>
          {draft.isNew && <TextInput accessibilityLabel="Purchase merchant" placeholder="Costco, Target, your favorite shop…" maxLength={80} value={draft.merchant} onChangeText={merchant => change({ merchant })} style={s.input}/>}
          {draft.isNew ? <><Text style={s.label}>Purchase amount</Text><TextInput accessibilityLabel="Purchase amount" keyboardType="decimal-pad" value={draft.amount} onChangeText={amount => change({ amount })} style={s.input}/>
            <Text style={s.label}>Account</Text><View style={s.chips}>{state.accounts.map(a => <Button key={a.id} title={a.name} artworkAction="banking" color="#14C8BD" selected={a.id === draft.accountId} onPress={() => change({ accountId: a.id })}/>)}</View>
            <TextInput accessibilityLabel="New category account name" placeholder="Name another account" maxLength={80} value={newAccount} onChangeText={setNewAccount} style={s.input}/>
            <Button title="Add this account" color="#FFE34F" disabled={!newAccount.trim()} onPress={async () => { const id = newId('account'); if (await act({ type: 'add-account', id, name: newAccount }, 'Account added.')) { setNewAccount(''); change({ accountId: id }); } }}/>
          </> : <Text style={s.body}>{accountName(draft.accountId)} · {draft.date} · {dollars(draft.amountCents)}</Text>}
        </View>}
        {!draft.splits ? <>
          <CategoryTiles selected={draft.category} onSelect={category => change({ category })} customCategories={customCategories}/>
          <Text style={s.label}>Or name your own category</Text>
          <TextInput accessibilityLabel="Custom category" placeholder="Whatever makes sense to you" maxLength={40} value={draft.category} onChangeText={category => change({ category })} style={s.input}/>
          {!draft.ruleId && <View style={s.card}>
            <Text style={s.heading}>Remember this for {draft.merchant || 'this merchant'}?</Text>
            <Button title="Just this purchase" selected={draft.scope === 'once'} color="#FF8479" onPress={() => change({ scope: 'once' })}/>
            <Button title="Remember for this account" selected={draft.scope === 'account'} color="#14C8BD" onPress={() => change({ scope: 'account' })}/>
            <Button title="Remember across my accounts" selected={draft.scope === 'all'} onPress={() => change({ scope: 'all' })}/>
            {draft.scope === 'all' && <Text style={s.note}>An existing choice for a specific account still takes priority.</Text>}
            {draft.scope !== 'once' && <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: draft.includePast }} onPress={() => change({ includePast: !draft.includePast })} style={s.check}><Text style={s.body}>{draft.includePast ? '☑' : '☐'} Also update previous matching purchases</Text></TouchableOpacity>}
            {draft.scope !== 'once' && <Text style={s.note}>One-time choices and split purchases keep their categories.</Text>}
            <Button title="Split this purchase" color="#FFE34F" disabled={!draft.isNew && draft.amountCents <= 0} onPress={() => change({ splits: [{ category: 'Groceries', amount: '' }, { category: 'Clothing', amount: '' }] })}/>
          </View>}
          {draft.ruleId && <Text style={s.note}>Updates purchases using this remembered rule and future matching purchases. One-time choices and splits stay as you set them.</Text>}
        </> : <View style={s.card}>
          <Text style={s.heading}>A little of this, a little of that</Text><Text style={s.body}>Split {draft.isNew ? draft.amount ? dollars(Math.round(Number(draft.amount) * 100)) : 'your purchase total' : dollars(draft.amountCents)} exactly. This applies to this purchase only.</Text>
          {draft.splits.map((part, index) => <View key={index} style={s.split}>
            <TextInput accessibilityLabel={`Split ${index + 1} category`} maxLength={40} value={part.category} onChangeText={category => change({ splits: draft.splits.map((p, i) => i === index ? { ...p, category } : p) })} style={s.input}/>
            <TextInput accessibilityLabel={`Split ${index + 1} amount`} keyboardType="decimal-pad" value={part.amount} onChangeText={amount => change({ splits: draft.splits.map((p, i) => i === index ? { ...p, amount } : p) })} style={s.input}/>
            {draft.splits.length > 2 && <Button title={`Remove split ${index + 1}`} color="#FF8479" onPress={() => change({ splits: draft.splits.filter((_, i) => i !== index) })}/>}
          </View>)}
          <Button title="Add another category" color="#FFE34F" disabled={draft.splits.length >= 20} onPress={() => change({ splits: [...draft.splits, { category: '', amount: '' }] })}/>
          <Button title="Use one category instead" color="#FF8479" onPress={() => change({ splits: undefined })}/>
        </View>}
      </> : <>
        <View style={s.chips}><Button title="Purchases" selected={page === 'purchases'} color="#14C8BD" onPress={() => setPage('purchases')}/><Button title="Remembered categories" selected={page === 'rules'} onPress={() => setPage('rules')}/></View>
        {page === 'purchases' ? <>
          <Button title="+ Add a purchase" color="#FFE34F" onPress={() => openPurchase(null)}/>
          <View style={s.chips}><Button title="All accounts" color="#FF8479" selected={accountFilter === null} onPress={() => setAccountFilter(null)}/>{state.accounts.map(a => <Button key={a.id} title={a.name} artworkAction="banking" color="#14C8BD" selected={accountFilter === a.id} onPress={() => setAccountFilter(a.id)}/>)}</View>
          {!purchases.length && <View style={s.card}><Text style={s.heading}>Every purchase gets a place</Text><Text style={s.body}>Add your first purchase, choose its category, and tell us whether to remember it.</Text></View>}
          {purchases.map(t => { const chosen = purchaseCategory(state, t); return <View key={t.id} style={s.card}>
            <Text style={s.heading}>{t.merchant} · {dollars(t.amountCents)}</Text><Text style={s.note}>{accountName(t.accountId)} · {t.date}</Text>
            <Button title={chosen.category} label={`Change category for ${t.merchant}, ${chosen.category}, ${accountName(t.accountId)}, ${dollars(t.amountCents)}`} color="#14C8BD" onPress={() => openPurchase(t)}/>
            <Text style={s.note}>{chosen.source}</Text>{chosen.splits?.map((part, i) => <Text key={i} style={s.body}>{part.category} · {dollars(part.amountCents)}</Text>)}
            <Button title="Remove purchase" color="#FF8479" onPress={() => act({ type: 'delete-purchase', id: t.id }, 'Purchase removed. You can undo this.')}/>
          </View>; })}
        </> : <>
          <Text style={s.body}>Your own categories always come first. A choice for one account takes priority over a choice across all accounts.</Text>
          {!state.rules.length && <Text style={s.body}>No remembered categories yet. Choose one while fixing or adding a purchase.</Text>}
          {state.rules.map(rule => <View key={rule.id} style={s.card}>
            <Text style={s.heading}>{rule.merchant} → {rule.category}</Text><Text style={s.note}>{rule.accountId === null ? 'Across my accounts' : accountName(rule.accountId)}</Text>
            <Button title={`Change ${rule.merchant} category`} color="#14C8BD" onPress={() => { setError(''); setDraft({ ruleId: rule.id, merchant: rule.merchant, category: rule.category }); }}/>
            <Button title={`Forget this ${rule.merchant} rule`} color="#FF8479" onPress={() => act({ type: 'delete-rule', id: rule.id }, 'Remembered choice removed. One-time choices and splits stay as you set them.')}/>
          </View>)}
        </>}
      </>}
    </ScrollView>{draft && <View style={s.footer}>{error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}<Button title={busy ? 'Saving your choice…' : 'Save my choice'} color="#14C8BD" disabled={busy} onPress={save}/></View>}</KeyboardAvoidingView>
  </Modal>;
}
const s = StyleSheet.create({
  surface: { flex: 1, backgroundColor: '#F6FBFF' }, page: { padding: 18, paddingTop: 58, paddingBottom: 56, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: { color: ink, fontSize: 25, fontWeight: '900' }, heading: { color: ink, fontSize: 18, fontWeight: '800' }, body: { color: '#334660', fontSize: 16, lineHeight: 24 }, note: { color: '#43546B', fontSize: 14, lineHeight: 21 }, label: { color: ink, fontWeight: '800', fontSize: 16 },
  card: { padding: 16, borderRadius: 22, backgroundColor: 'white', gap: 12, borderWidth: 1, borderColor: '#DCE9F0' },
  button: { minHeight: 48, borderRadius: 16, padding: 14, borderWidth: 3, borderColor: 'transparent', justifyContent: 'center' }, buttonText: { fontSize: 16, fontWeight: '800', textAlign: 'center', flexShrink: 1 }, selected: { borderColor: ink },
  input: { backgroundColor: 'white', color: ink, borderWidth: 1, borderColor: '#8797AB', minHeight: 50, padding: 12, borderRadius: 12, fontSize: 17 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, tile: { flexBasis: '48%', flexGrow: 0, minWidth: 120, padding: 4, borderRadius: 24, borderWidth: 3, borderColor: 'rgba(255,255,255,.9)', overflow: 'hidden', justifyContent: 'center', minHeight: 60 }, tileText: { fontSize: 18, lineHeight: 24, fontWeight: '900', textAlign: 'center', padding: 8, minHeight: 48 },
  footer: { padding: 16, paddingBottom: 34, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#DCE9F0' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, check: { minHeight: 48, paddingVertical: 10, justifyContent: 'center' }, error: { color: '#92273B', fontSize: 16, lineHeight: 24 }, notice: { padding: 16, borderRadius: 18, backgroundColor: '#DFFCF7', gap: 12 }, split: { gap: 8, borderBottomWidth: 1, borderBottomColor: '#DCE9F0', paddingBottom: 12 },
  entry: { padding: 16, backgroundColor: '#EEE7FF', borderRadius: 24, gap: 10, borderWidth: 2, borderColor: '#B799EC' }, preview: { flexDirection: 'row', gap: 8 }, previewTile: { flex: 1, borderRadius: 14, overflow: 'hidden' }, previewLabel: { fontSize: 13, fontWeight: '800', textAlign: 'center', padding: 6 }, entryLink: { fontSize: 17, color: '#542199', fontWeight: '900', paddingVertical: 8 },
});
