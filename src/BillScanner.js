import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from './Privacy';
import FittedArtwork from './FittedArtwork';
import { scanBillPhoto, supportsBillPhoto } from './bill-photo';
import { parseBillText } from './bill-scanner.mjs';
import { parseBreakdown } from './billiam-tools.mjs';
import BillDraftReview from './BillDraftReview';

const artwork = require('../assets/characters/billiam-bill-scanner.png');

export default function BillScanner({ bills = [], onAdd, onUpdate, history = [], templates = [], onRecurring, initialOpen = false }) {
  const [open, setOpen] = useState(initialOpen);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const [reviewKey, setReviewKey] = useState(0);
  const [message, setMessage] = useState('');
  const [confirmedDuplicate, setConfirmedDuplicate] = useState(false);
  const active = useRef(true), request = useRef(0), working = useRef(false), saving = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; request.current++; }; }, []);

  function close() {
    request.current++;
    setOpen(false); setDraft(null); setMessage(''); setConfirmedDuplicate(false);
  }
  async function scan(source) {
    if (working.current) return;
    working.current = true;
    const token = ++request.current;
    setBusy(true); setMessage('');
    try {
      const text = await scanBillPhoto(source);
      if (!active.current || token !== request.current || text === null) return;
      setDraft({...parseBillText(text),breakdown:parseBreakdown(text)}); setReviewKey(v=>v+1); setConfirmedDuplicate(false);
      setMessage('Check every field against your bill. Nothing has been saved yet.');
    } catch (error) {
      if (active.current && token === request.current) setMessage(error.message || 'The photo could not be read. Please try again.');
    } finally {
      working.current = false;
      if (active.current) setBusy(false);
    }
  }
  const action = (label, onPress, disabled = false) => <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={[s.action, disabled && s.disabled]}><Text style={s.actionText}>{label}</Text></TouchableOpacity>;
  return <View style={s.card} testID="billiam-scanner-card">
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Billiam’s bill scanning" accessibilityState={{expanded:open}} onPress={() => open ? close() : setOpen(true)}>
      <FittedArtwork source={artwork} style={s.artwork} testID="billiam-scanner-artwork" accessible={false} />
      <View style={s.caption}>
        <Text style={s.title}>Billiam’s bill scanning</Text>
        <Text style={s.description}>A photo shoot with Daddy. A simpler way to add your bills.</Text>
        <Text style={s.link}>{open ? 'Close scanner' : 'Scan a bill photo'}</Text>
      </View>
    </TouchableOpacity>
    {open && <View style={s.review}>
      <Text style={s.description}>Take or choose a photo, then review the details before adding your bill. PayPlace reads the photo on your device.</Text>
      {supportsBillPhoto ? <>
        {action('Take a bill photo', () => { saving.current = false; scan('camera'); }, busy)}
        {action('Choose a bill photo', () => { saving.current = false; scan('library'); }, busy)}
      </> : <Text style={s.notice}>Photo scanning is available in the iPhone and Android app. You can still add bills manually here.</Text>}
      {busy && <View accessibilityLiveRegion="polite"><ActivityIndicator /><Text style={s.description}>Billiam is reading your photo…</Text></View>}
      {!!message && <Text accessibilityLiveRegion="polite" style={s.notice}>{message}</Text>}
      {draft && <BillDraftReview key={reviewKey} initial={draft} bills={bills} history={history} templates={templates} onUpdate={onUpdate} onRecurring={onRecurring} onSave={reviewed=>{
        if (onAdd(reviewed) === false) return false;
        setDraft(null); setMessage('Bill added. Billiam is ready for another photo.'); return true;
      }} />}
      {action('Cancel bill scan', close)}
    </View>}
  </View>;
}

const s = StyleSheet.create({
  card:{width:'100%', marginTop:16, marginBottom:12, borderRadius:20, borderWidth:2, borderColor:'#D8CCFF', backgroundColor:'#F8F5FF', overflow:'hidden'},
  // A measured frame bounds BOTH native image dimensions. Text has its own space.
  artwork:{height:128, maxHeight:128, backgroundColor:'#F7EEDB'},
  caption:{padding:14, gap:6}, title:{fontSize:18, fontWeight:'800', color:'#243447'},
  description:{fontSize:14, lineHeight:21, color:'#44546A'}, link:{fontSize:15, fontWeight:'800', color:'#5B3AB8'},
  review:{padding:14, paddingTop:0, gap:10}, notice:{fontSize:14, lineHeight:21, color:'#44336C', paddingVertical:8},
  action:{minHeight:48, padding:13, borderRadius:14, backgroundColor:'#6545B9', marginTop:8, justifyContent:'center'},
  actionText:{fontSize:16, fontWeight:'700', textAlign:'center', color:'#FFFFFF', flexShrink:1}, disabled:{opacity:0.5},
  field:{marginTop:12}, label:{fontSize:14, fontWeight:'700', color:'#243447', marginBottom:6},
  input:{minHeight:48, borderWidth:1, borderColor:'#A69ABD', borderRadius:12, padding:12, backgroundColor:'#FFFFFF', color:'#243447', fontSize:16},
});
