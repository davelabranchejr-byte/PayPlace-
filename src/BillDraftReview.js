import React,{useRef,useState} from 'react';
import {StyleSheet,TouchableOpacity,View} from 'react-native';
import {Text,TextInput} from './Privacy';
import {duplicateScannedBill} from './bill-scanner.mjs';
import {BREAKDOWN_FIELDS,compareBills,previousReading,recurringMatch,reviewBilliamDraft,vendorKey} from './billiam-tools.mjs';
export default function BillDraftReview({initial,bills=[],history=[],templates=[],onSave,onUpdate,onSkip,onRecurring}){
  const [draft,setDraft]=useState({...initial,breakdown:initial.breakdown || {}}),[error,setError]=useState(''),[confirmed,setConfirmed]=useState(false),[remember,setRemember]=useState(false),[cadence,setCadence]=useState('monthly');
  const saved=useRef(false);
  const duplicate=duplicateScannedBill(draft,bills),prior=previousReading(draft,bills,history),template=recurringMatch(draft,templates);
  const existing=bills.filter(b=>vendorKey(b.name)===vendorKey(draft.name)&&(b.accountNumberLast4 || '')===(draft.accountNumberLast4 || '')&&(b.dueDate || b.due)===draft.due&&!b.paid&&b.status!=='Paid');
  const edit=(field,value)=>{setDraft(current=>({...current,[field]:value}));setConfirmed(false);setError('');};
  function save(update=false){
    if(saved.current)return;
    try{
      const reviewed=reviewBilliamDraft(draft);
      if(!update&&duplicateScannedBill(reviewed,bills)&&!confirmed)throw Error('Confirm this is a separate bill before adding it.');
      if(update&&existing.length!==1)throw Error('Choose one existing bill to update.');
      saved.current=true;
      const result=update?onUpdate?.({...existing[0],...reviewed,id:existing[0].id}):onSave(reviewed);
      if(result===false){saved.current=false;return;}
      if(remember&&onRecurring)onRecurring(reviewed,template?.cadence || cadence);
    }catch(e){saved.current=false;setError(e.message);}
  }
  const button=(label,onPress,disabled=false)=><TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={[s.button,disabled&&{opacity:0.5}]}><Text style={s.buttonText}>{label}</Text></TouchableOpacity>;
  let change;try{if(prior)change=compareBills(draft,prior);}catch{}
  return <View testID="bill-draft-review">
    <Text style={s.title}>Review scanned bill</Text><Text style={s.body}>Check every field against the original. Nothing is added until you confirm.</Text>
    {[['name','Scanned bill name','Company or bill name'],['amount','Scanned amount','125.00'],['due','Scanned due date','YYYY-MM-DD'],['accountNumberLast4','Scanned account last four digits','Optional'],['notes','Scanned bill notes','Optional']].map(([key,label,placeholder])=><View key={key}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={draft[key] || ''} placeholder={placeholder} onChangeText={value=>edit(key,value)} maxLength={key==='accountNumberLast4'?4:key==='notes'?1000:100} keyboardType={key==='amount'?'decimal-pad':key==='accountNumberLast4'?'number-pad':'default'} style={s.input}/></View>)}
    <Text style={s.title}>What makes up this bill?</Text><Text style={s.body}>Optional statement figures. They can overlap; do not add them together. The total due above controls your plan.</Text>
    {BREAKDOWN_FIELDS.map(([key,label])=><View key={key}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={`Scanned ${label.toLowerCase()}`} keyboardType="decimal-pad" value={draft.breakdown[key] || ''} placeholder="Optional" onChangeText={value=>setDraft(current=>({...current,breakdown:{...current.breakdown,[key]:value}}))} style={s.input}/></View>)}
    {change&&<View style={s.notice}><Text style={s.label}>Compared with {prior.dueDate || prior.due}</Text><Text style={s.body}>{change.deltaCents===0?'Same total as the previous bill.':`${change.deltaCents>0?'Up':'Down'} $${(Math.abs(change.deltaCents)/100).toFixed(2)} (${Math.abs(change.percent)}%).`}</Text>{change.changes.map(c=><Text key={c.key} style={s.body}>{c.label}: {c.deltaCents>0?'+':'−'}${(Math.abs(c.deltaCents)/100).toFixed(2)}</Text>)}{!change.changes.length&&<Text style={s.body}>No itemized change is recorded. Check the statement for the reason.</Text>}</View>}
    {!!prior&&!template&&<Text style={s.notice}>This company and account appear in an earlier billing period. If the bill repeats, you can remember its cycle below.</Text>}
    {!!template&&<Text style={s.notice}>Billiam recognizes your {template.cadence} {template.name} bill. Review this cycle before saving.</Text>}
    {!!onRecurring&&<>
      <TouchableOpacity accessibilityRole="checkbox" accessibilityLabel="Remember this recurring bill" accessibilityState={{checked:remember}} onPress={()=>setRemember(v=>!v)} style={s.check}><Text style={s.body}>{remember?'✓':'○'} {template?'Update this recurring template after saving':'Remember this as a recurring bill'}</Text></TouchableOpacity>
      {remember&&!template&&<View style={s.row}>{['monthly','quarterly','yearly'].map(value=>button(`${value}${cadence===value?' ✓':''}`,()=>setCadence(value)))}</View>}
    </>}
    {duplicate&&<><Text style={s.notice}>This name, amount and due date are already in your list.</Text><TouchableOpacity accessibilityRole="checkbox" accessibilityLabel="This is a separate bill" accessibilityState={{checked:confirmed}} onPress={()=>setConfirmed(v=>!v)} style={s.check}><Text style={s.body}>{confirmed?'✓':'○'} This is a separate bill</Text></TouchableOpacity></>}
    {!!error&&<Text accessibilityRole="alert" style={s.notice}>{error}</Text>}
    {button('Add reviewed bill',()=>save(),!!duplicate&&!confirmed)}
    {existing.length===1&&!!onUpdate&&button('Update existing bill for this due date',()=>save(true))}
    {!!onSkip&&button('Skip this bill',onSkip)}
  </View>;
}
const s=StyleSheet.create({title:{fontSize:19,fontWeight:'800',color:'#243447',marginTop:14},body:{fontSize:15,lineHeight:23,color:'#34465E'},label:{fontSize:15,fontWeight:'700',color:'#243447',marginTop:12,marginBottom:6},input:{minHeight:48,borderWidth:1,borderColor:'#A69ABD',borderRadius:12,padding:12,fontSize:16,color:'#243447',backgroundColor:'white'},button:{minHeight:48,backgroundColor:'#6545B9',padding:13,borderRadius:14,marginTop:10,justifyContent:'center'},buttonText:{color:'white',fontSize:16,fontWeight:'700',textAlign:'center',flexShrink:1},notice:{padding:12,marginTop:12,backgroundColor:'#EEE8FF',borderRadius:12,color:'#44336C',fontSize:15,lineHeight:23},check:{minHeight:48,justifyContent:'center',paddingVertical:10},row:{flexDirection:'row',flexWrap:'wrap',gap:8}});
