import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,ScrollView,StyleSheet,TouchableOpacity,View} from 'react-native';
import {Text} from './Privacy';
import FittedArtwork from './FittedArtwork';
import EntrySheet from './EntrySheet';
import BillScanner from './BillScanner';
import BillDraftReview from './BillDraftReview';
import HouseholdPlan from './HouseholdPlan';
import {importBillDocuments,importBillBatch,supportsBillImport} from './bill-import';
import {BREAKDOWN_FIELDS,compareBills,previousReading,recurringDraft,saveRecurring,vendorKey} from './billiam-tools.mjs';
const mailbox=require('../assets/characters/billiam-mailbox.png');
export const BILLIAM_TASKS=[
  {id:'scan',title:'Scan a bill',body:'Daddy’s photo shoot, with a practical twist.',image:require('../assets/characters/billiam-bill-scanner.png')},
  {id:'import',title:'Import PDFs & screenshots',body:'Bring your digital bills to the mailbox.',image:require('../assets/characters/billiam-import.png')},
  {id:'batch',title:'Review a stack of bills',body:'Read several photos; review one at a time.',image:require('../assets/characters/billiam-batch.png')},
  {id:'compare',title:'Why did this bill go up?',body:'Compare totals and recorded charges.',image:require('../assets/characters/billiam-compare.png')},
  {id:'recurring',title:'Recognize recurring bills',body:'Keep familiar bills organized by cycle.',image:require('../assets/characters/billiam-recurring.png')},
  {id:'breakdown',title:'Understand a bill',body:'Look at charges, past-due amounts and fees.',image:require('../assets/characters/billiam-breakdown.png')},
  {id:'household',title:'Our household plan',body:'Choose who covers what and what to share.',image:require('../assets/characters/billiam-household.png')},
];
export function BilliamShortcut({onPress}){
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel="Visit Billiam’s mailbox" onPress={onPress} style={s.shortcut}><FittedArtwork source={mailbox} style={{height:112}} testID="billiam-shortcut-artwork" accessible={false}/><Text style={s.title}>Billiam’s bill scanning & tools</Text><Text style={s.body}>Visit his mailbox outside Annie Oak Tree.</Text></TouchableOpacity>;
}
export function BilliamTaskButton({task,onPress}){
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Billiam: ${task.title}`} onPress={onPress} style={s.task} testID={`billiam-task-${task.id}`}>
    <FittedArtwork source={task.image} style={s.taskArt} testID={`billiam-${task.id}-artwork`} accessible={false}/><View style={s.caption}><Text style={s.taskTitle}>{task.title}</Text><Text style={s.taskBody}>{task.body}</Text></View>
  </TouchableOpacity>;
}
function ImportReview({batch,bills,history,templates,onAdd,onUpdate,onRecurring}){
  const [queue,setQueue]=useState([]),[index,setIndex]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(0),[skipped,setSkipped]=useState(0);
  const active=useRef(true),working=useRef(false);
  useEffect(()=>()=>{active.current=false;},[]);
  async function pick(){if(working.current)return;working.current=true;setBusy(true);setError('');try{const results=await(batch?importBillBatch():importBillDocuments());if(active.current&&results!==null){setQueue(results);setIndex(0);setSaved(0);setSkipped(0);}}catch(e){if(active.current)setError(e.message);}finally{working.current=false;if(active.current)setBusy(false);}}
  const next=()=>setIndex(v=>v+1),item=queue[index];
  return <View><Text style={s.body}>{batch?'Choose up to 12 bill photos.':'Choose up to 12 PDF or image files. Each PDF may have up to 12 pages and represents one bill.'} Read on your device. Each bill is reviewed separately.</Text>{!supportsBillImport&&<Text style={s.body}>Importing is available in the iPhone and Android app.</Text>}
    {!queue.length||index>=queue.length?<TouchableOpacity accessibilityRole="button" accessibilityLabel={batch?'Choose bill photo stack':'Choose bill PDF or screenshot files'} disabled={busy||!supportsBillImport} onPress={pick} style={s.button}><Text style={s.buttonText}>{busy?'Reading bills…':batch?'Choose bill photos':'Choose PDF or image files'}</Text></TouchableOpacity>:null}
    {busy&&<ActivityIndicator/>}{!!error&&<Text accessibilityRole="alert" style={s.notice}>{error}</Text>}
    {!!queue.length&&<Text accessibilityLiveRegion="polite" style={s.body}>{saved} added or updated · {skipped} skipped · {Math.max(0,queue.length-index)} left to review</Text>}
    {item&&<View><Text style={s.title}>{item.label} of {queue.length}</Text>{item.error?<><Text style={s.notice}>{item.error}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Skip unreadable bill" onPress={()=>{setSkipped(v=>v+1);next();}} style={s.button}><Text style={s.buttonText}>Skip unreadable bill</Text></TouchableOpacity></>:<BillDraftReview key={index} initial={item.draft} bills={bills} history={history} templates={templates} onRecurring={onRecurring} onSave={draft=>{if(onAdd(draft)===false)return false;setSaved(v=>v+1);next();return true;}} onUpdate={draft=>{if(onUpdate(draft)===false)return false;setSaved(v=>v+1);next();return true;}} onSkip={()=>{setSkipped(v=>v+1);next();}}/>}</View>}
  </View>;
}
function Comparison({bills,history}){
  const [selected,setSelected]=useState(null),[older,setOlder]=useState(null);
  const prior=older || (selected&&previousReading(selected,bills,history));
  let result;try{if(selected&&prior)result=compareBills(selected,prior);}catch{}
  return <View><Text style={s.body}>Choose the newer bill. Billiam finds an earlier bill for the same company and account, or you can choose one below. Only recorded figures can explain a change.</Text>{bills.map(b=><TouchableOpacity key={b.id} accessibilityRole="button" accessibilityLabel={`Compare ${b.name} ${b.dueDate || b.due}`} onPress={()=>{setSelected(b);setOlder(null);}} style={s.choice}><Text style={s.body}>{selected?.id===b.id?'✓ ':''}{b.name} · ${Number(b.amount).toFixed(2)} · {b.dueDate || b.due}</Text></TouchableOpacity>)}
    {!bills.length&&<Text style={s.body}>Add bills from two billing periods to compare them.</Text>}
    {selected&&<><Text style={s.title}>Choose the earlier statement</Text>{[...history,...bills].filter(b=>vendorKey(b.name)===vendorKey(selected.name)&&(b.accountNumberLast4 || '')===(selected.accountNumberLast4 || '')&&(b.dueDate || b.due)<(selected.dueDate || selected.due)).slice(-30).map((b,i)=><TouchableOpacity key={i} accessibilityRole="button" accessibilityLabel={`Earlier bill ${b.dueDate || b.due} ${b.amount}`} onPress={()=>setOlder(b)} style={s.choice}><Text style={s.body}>{b.dueDate || b.due} · ${Number(b.amount).toFixed(2)}</Text></TouchableOpacity>)}</>}
    {result?<View style={s.notice}><Text style={s.title}>{selected.name}</Text><Text style={s.body}>Earlier: ${Number(prior.amount).toFixed(2)} · {prior.dueDate || prior.due}</Text><Text style={s.body}>Newer: ${Number(selected.amount).toFixed(2)} · {selected.dueDate || selected.due}</Text><Text style={s.body}>{result.deltaCents===0?'The total is unchanged.':`${result.deltaCents>0?'Up':'Down'} $${(Math.abs(result.deltaCents)/100).toFixed(2)} (${Math.abs(result.percent)}%).`}</Text>{result.changes.map(c=><Text key={c.key} style={s.body}>{c.label}: {c.deltaCents>0?'+':'−'}${(Math.abs(c.deltaCents)/100).toFixed(2)}</Text>)}{!result.changes.length&&<Text style={s.body}>No itemized change is recorded. Check your statements for the reason; Billiam will not invent one.</Text>}</View>:selected&&<Text style={s.body}>No earlier matching statement is available yet.</Text>}
  </View>;
}
function Recurring({bills,templates,onTemplates,onAdd,onUpdate,history}){
  const [draft,setDraft]=useState(null),[error,setError]=useState('');
  function remember(bill,cadence){try{onTemplates(saveRecurring(templates,bill,cadence,`repeat-${Date.now()}`));setError('');}catch(e){setError(e.message);}}
  return <View><Text style={s.body}>Remember a bill’s company, account ending and cycle. The next date is suggested, but the new amount stays blank for review. This never schedules a payment.</Text>
    {templates.map(t=><View key={t.id} style={s.notice}><Text style={s.title}>{t.name} · {t.cadence}</Text><Text style={s.body}>Last recorded cycle: {t.lastDue}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Prepare next ${t.name} bill`} onPress={()=>{try{setDraft(recurringDraft(t));setError('');}catch(e){setError(e.message);}}} style={s.button}><Text style={s.buttonText}>Prepare next bill</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Stop remembering ${t.name}`} onPress={()=>onTemplates(templates.filter(x=>x.id!==t.id))} style={s.choice}><Text style={s.body}>Stop remembering this bill</Text></TouchableOpacity></View>)}
    <Text style={s.title}>Remember a saved bill</Text>{bills.map(b=><View key={b.id} style={s.choice}><Text style={s.body}>{b.name} · {b.dueDate || b.due}</Text><View style={s.row}>{['monthly','quarterly','yearly'].map(c=><TouchableOpacity key={c} accessibilityRole="button" accessibilityLabel={`Remember ${b.name} ${c}`} onPress={()=>remember(b,c)} style={s.smallButton}><Text style={s.buttonText}>{c}</Text></TouchableOpacity>)}</View></View>)}
    {!!error&&<Text accessibilityRole="alert" style={s.notice}>{error}</Text>}
    {draft&&<BillDraftReview key={JSON.stringify([draft.name,draft.due])} initial={draft} bills={bills} history={history} templates={templates} onSave={b=>{if(onAdd(b)===false)return false;const match=templates.find(t=>vendorKey(t.name)===vendorKey(b.name)&&(t.accountNumberLast4 || '')===(b.accountNumberLast4 || ''));remember(b,match?.cadence || 'monthly');setDraft(null);return true;}} onUpdate={onUpdate} onSkip={()=>setDraft(null)}/>}
  </View>;
}
function Breakdown({bills,onUpdate}){
  const [selected,setSelected]=useState(null);
  return <View><Text style={s.body}>Review the total due and the statement’s current charges, past-due balance, minimum payment and fees. These figures can overlap and are not summed.</Text>{bills.map(b=><View key={b.id} style={s.choice}><Text style={s.title}>{b.name} · ${Number(b.amount).toFixed(2)}</Text>{BREAKDOWN_FIELDS.map(([key,label])=><Text key={key} style={s.body}>{label}: {b.breakdown?.[key]!==undefined?`$${b.breakdown[key]}`:'Not recorded'}</Text>)}<TouchableOpacity accessibilityRole="button" accessibilityLabel={`Review breakdown for ${b.name}`} onPress={()=>setSelected(b)} style={s.button}><Text style={s.buttonText}>Review bill breakdown</Text></TouchableOpacity></View>)}
    {selected&&<BillDraftReview key={selected.id} initial={{...selected,due:selected.dueDate || selected.due}} bills={[]} onSave={draft=>{if(onUpdate({...selected,...draft})===false)return false;setSelected(null);return true;}} onSkip={()=>setSelected(null)}/>}
  </View>;
}
export default function BilliamHome({finance,onAdd,onUpdate,onTemplates,onHousehold}){
  const [tool,setTool]=useState(null),templates=Array.isArray(finance.billiamRecurring)?finance.billiamRecurring:[],history=Array.isArray(finance.billiamHistory)?finance.billiamHistory:[],bills=finance.bills || [];
  const task=BILLIAM_TASKS.find(t=>t.id===tool);
  const recurring=(bill,cadence)=>onTemplates(saveRecurring(templates,bill,cadence,`repeat-${Date.now()}`));
  return <ScrollView contentContainerStyle={s.content} style={s.screen}><Text style={s.heading}>Billiam’s Mailbox</Text><Text style={s.body}>His little home outside Annie Oak Tree. Bring a bill; leave with a clearer plan.</Text><FittedArtwork source={mailbox} style={s.hero} testID="billiam-mailbox-artwork" accessibilityLabel="Billiam peeks out of his teal mailbox home beside Annie Oak Tree’s red door"/>
    <View style={s.grid}>{BILLIAM_TASKS.map(t=><BilliamTaskButton key={t.id} task={t} onPress={()=>setTool(t.id)}/>)}</View>
    <EntrySheet visible={!!task} title={task?.title || 'Billiam'} onClose={()=>setTool(null)}>
      {tool==='scan'&&<BillScanner initialOpen bills={bills} onAdd={onAdd} onUpdate={onUpdate} history={history} templates={templates} onRecurring={recurring}/>}
      {(tool==='import'||tool==='batch')&&<ImportReview batch={tool==='batch'} bills={bills} history={history} templates={templates} onAdd={onAdd} onUpdate={onUpdate} onRecurring={recurring}/>}
      {tool==='compare'&&<Comparison bills={bills} history={history}/>}
      {tool==='recurring'&&<Recurring bills={bills} templates={templates} onTemplates={onTemplates} onAdd={onAdd} onUpdate={onUpdate} history={history}/>}
      {tool==='breakdown'&&<Breakdown bills={bills} onUpdate={onUpdate}/>}
      {tool==='household'&&<HouseholdPlan bills={bills} value={finance.householdPlan} onChange={onHousehold}/>}
    </EntrySheet>
  </ScrollView>;
}
const s=StyleSheet.create({screen:{flex:1,backgroundColor:'#FFFDF8'},content:{padding:16,paddingBottom:32},heading:{fontSize:26,fontWeight:'900',color:'#243447'},title:{fontSize:18,fontWeight:'800',color:'#243447',marginTop:8},body:{fontSize:15,lineHeight:23,color:'#34465E',marginTop:6},hero:{height:144,marginVertical:14,borderRadius:18,backgroundColor:'#F8EEDB'},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12},task:{width:'48%',borderWidth:1,borderColor:'#D8CCFF',borderRadius:18,backgroundColor:'#F7F3FF',overflow:'hidden'},taskArt:{height:100,backgroundColor:'#F8EEDB'},caption:{padding:12,gap:6},taskTitle:{fontSize:16,fontWeight:'800',color:'#243447'},taskBody:{fontSize:13,lineHeight:19,color:'#44546A'},shortcut:{marginVertical:16,borderRadius:18,borderWidth:2,borderColor:'#D8CCFF',padding:12,backgroundColor:'#F7F3FF'},button:{minHeight:48,backgroundColor:'#6545B9',padding:13,borderRadius:14,marginTop:12,justifyContent:'center'},buttonText:{fontSize:15,fontWeight:'700',color:'white',textAlign:'center'},choice:{minHeight:48,padding:12,backgroundColor:'#F3EEFF',borderRadius:14,marginTop:10},notice:{padding:14,backgroundColor:'#EEE8FF',borderRadius:14,marginTop:12,color:'#44336C'},row:{flexDirection:'row',flexWrap:'wrap',gap:8},smallButton:{minHeight:48,padding:12,backgroundColor:'#6545B9',borderRadius:12,marginTop:8,justifyContent:'center'}});
