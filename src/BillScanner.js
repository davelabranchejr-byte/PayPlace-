import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text, TextInput } from './Privacy';
import FittedArtwork from './FittedArtwork';
import CaptionedArtwork from './CaptionedArtwork';
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
    <TouchableOpacity artworkMode="integrated" accessibilityRole="button" accessibilityLabel="Billiam’s bill scanning"
      accessibilityHint={open ? 'Closes the scanner' : 'Opens the bill photo scanner'} accessibilityState={{expanded:open}}
      style={s.toggle} onPress={() => open ? close() : setOpen(true)}>
      <CaptionedArtwork overlapFraction={0.21} testID="billiam-scanner"
        artwork={<FittedArtwork source={artwork} aspectRatio={3 / 2} testID="billiam-scanner-artwork" accessible={false} />}>
        <Text style={s.title}>{open ? 'Close scanner' : 'Billiam’s bill scanning'}</Text>
      </CaptionedArtwork>
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
  toggle:{overflow:'hidden',borderRadius:22,backgroundColor:'#1A182F'},
  title:{fontSize:18, fontWeight:'800', color:'#FFFFFF', textAlign:'center'},
  description:{fontSize:14, lineHeight:21, color:'#44546A'},
  review:{padding:14, gap:10}, notice:{fontSize:14, lineHeight:21, color:'#44336C', paddingVertical:8},
  action:{minHeight:48, padding:13, borderRadius:14, backgroundColor:'#6545B9', marginTop:8, justifyContent:'center'},
  actionText:{fontSize:16, fontWeight:'700', textAlign:'center', color:'#FFFFFF', flexShrink:1}, disabled:{opacity:0.5},
  field:{marginTop:12}, label:{fontSize:14, fontWeight:'700', color:'#243447', marginBottom:6},
  input:{minHeight:48, borderWidth:1, borderColor:'#A69ABD', borderRadius:12, padding:12, backgroundColor:'#FFFFFF', color:'#243447', fontSize:16},
});
