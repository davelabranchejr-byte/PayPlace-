import React, { useRef, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Alert from './alert';
import { contributeSavings, saveSavingsGoal, savingsProgress } from './savings-goals.mjs';
const blank = { name: '', target: '', saved: '0' };
const money = cents => `$${(cents / 100).toFixed(2)}`;
function GoalCard({ goal, onChange, onEdit }) {
  const [amount, setAmount] = useState('');
  const progress = savingsProgress(goal);
  return <View style={s.goal}>
    <Text style={s.title}>{goal.name}</Text>
    <Text style={s.total}>{money(goal.savedCents)} of {money(goal.targetCents)}</Text>
    <View style={s.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: progress.percent }} accessibilityLabel={`${goal.name} savings progress`}><View style={[s.fill, { width: `${progress.percent}%` }]} /></View>
    <Text style={s.body}>{progress.complete ? 'Goal reached! You made room for something you love. 💜' : `${progress.percent}% saved · ${money(progress.remainingCents)} to go`}</Text>
    <Text style={s.label}>Money already set aside</Text>
    <TextInput accessibilityLabel={`Contribution for ${goal.name}`} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" style={s.input} />
    <Pressable accessibilityRole="button" style={s.button} onPress={() => { if (onChange(goal.id, amount)) setAmount(''); }}><Text style={s.buttonText}>Record savings</Text></Pressable>
    <Pressable accessibilityRole="button" style={s.edit} onPress={() => onEdit(goal)}><Text style={s.editText}>Edit goal or correct saved amount</Text></Pressable>
  </View>;
}
export default function SavingsGoals({ visible, onClose, goals, onUpdate }) {
  const [draft, setDraft] = useState(blank);
  const [error, setError] = useState('');
  const scroll = useRef(null);
  function save() {
    try { onUpdate(saveSavingsGoal(goals, draft, `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)); setDraft(blank); setError(''); }
    catch (e) { setError(e.message); }
  }
  function contribute(id, amount) {
    try { onUpdate(contributeSavings(goals, id, amount)); setError(''); return true; }
    catch (e) { setError(e.message); Alert.alert('Check that amount', e.message); return false; }
  }
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}><SafeAreaView style={s.safe}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
    <Pressable accessibilityRole="button" style={s.edit} onPress={onClose}><Text style={s.editText}>← Back to the neighborhood</Text></Pressable>
    <View style={s.heading}><View style={{ flex: 1 }}><Text style={s.eyebrow}>ONE SMALL STEP</Text><Text style={s.pageTitle}>Savings Goals</Text></View><Image source={require('../assets/characters/header-savings-westley-bobbie.png')} resizeMode="contain" style={s.headerArt} accessibilityLabel="Westley and Bobbie save coins toward a dream home" /></View>
    <Text style={s.body}>Give your dreams a place to grow. Track money you have already set aside. Recording savings does not transfer money or change your bank balance.</Text>
    <View style={s.form}><Text style={s.title}>{draft.id ? 'Edit your goal' : 'Start a goal'}</Text>
      {[['name', 'Goal name', 'A trip, a buffer, something special…'], ['target', 'Target amount', '500.00'], ['saved', 'Already saved', '0.00']].map(([key, label, placeholder]) => <View key={key}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={draft[key]} onChangeText={value => setDraft(current => ({ ...current, [key]: value }))} maxLength={key === 'name' ? 100 : 16} keyboardType={key === 'name' ? 'default' : 'decimal-pad'} placeholder={placeholder} style={s.input} /></View>)}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Pressable accessibilityRole="button" style={s.button} onPress={save}><Text style={s.buttonText}>{draft.id ? 'Save changes' : 'Create goal'}</Text></Pressable>
      {!!draft.id && <><Pressable accessibilityRole="button" style={s.edit} onPress={() => { setDraft(blank); setError(''); }}><Text style={s.editText}>Cancel editing</Text></Pressable><Pressable accessibilityRole="button" style={s.edit} onPress={() => Alert.alert('Remove this goal?', 'This only removes the tracker. Your actual savings stay where they are.', [{ text: 'Keep goal', style: 'cancel' }, { text: 'Remove goal', style: 'destructive', onPress: () => { onUpdate(goals.filter(goal => goal.id !== draft.id)); setDraft(blank); setError(''); } }])}><Text style={s.error}>Remove goal</Text></Pressable></>}
    </View>
    {!goals.length && <Text style={s.body}>Your first goal can be tiny. Progress counts at every size.</Text>}
    {goals.map(goal => <GoalCard key={goal.id} goal={goal} onChange={contribute} onEdit={item => { setDraft({ id: item.id, name: item.name, target: (item.targetCents / 100).toFixed(2), saved: (item.savedCents / 100).toFixed(2) }); setError(''); scroll.current?.scrollTo({ y: 0, animated: true }); }} />)}
  </ScrollView></KeyboardAvoidingView></SafeAreaView></Modal>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E6FFF5' }, content: { padding: 20, paddingBottom: 40 }, heading: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerArt: { width: '38%', maxWidth: 132, aspectRatio: 1 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: '#0B1F40' }, eyebrow: { color: '#6754C5', fontWeight: '900', letterSpacing: 1.5 }, title: { fontSize: 21, fontWeight: '900', color: '#0B1F40' }, body: { color: '#264B58', fontSize: 16, lineHeight: 24, marginVertical: 12 },
  form: { padding: 20, borderRadius: 24, backgroundColor: '#FFF0AC', marginVertical: 18 }, goal: { padding: 20, borderRadius: 24, backgroundColor: '#EAE3FF', marginBottom: 18 }, label: { color: '#264B58', fontWeight: '800', marginTop: 14, marginBottom: 6 }, input: { backgroundColor: '#F5FBFF', color: '#0B1F40', borderRadius: 14, padding: 14, minHeight: 48, fontSize: 17 },
  button: { backgroundColor: '#6650E9', borderRadius: 18, padding: 16, marginTop: 14, minHeight: 48 }, buttonText: { color: 'white', textAlign: 'center', fontSize: 17, fontWeight: '900' }, edit: { paddingVertical: 14, minHeight: 48 }, editText: { color: '#6754C5', fontWeight: '800', fontSize: 15 }, error: { color: '#96345F', marginTop: 10 }, total: { fontSize: 24, color: '#0B1F40', fontWeight: '900', marginVertical: 12 }, track: { height: 14, borderRadius: 7, backgroundColor: '#CEC4F4', overflow: 'hidden' }, fill: { height: '100%', backgroundColor: '#0BB9AC' },
});
