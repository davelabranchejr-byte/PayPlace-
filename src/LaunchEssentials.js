import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import { Text, TextInput } from './Privacy';
import { paydaySnapshot, moneyCents, canUndoPayment, quietSettings } from './launch-essentials.mjs';
import PayPlaceBrand from './PayPlaceBrand';
export const essentialsArtwork = {
  payday:require('../assets/characters/feature-until-payday.png'),
  history:require('../assets/characters/feature-payment-history.png'),
  firstWin:require('../assets/characters/feature-first-win.png'),
  quiet:require('../assets/characters/feature-quiet-mode.png'),
};
const captions={payday:['Until next payday','Bills, groceries, gas, and what remains.'],history:['Undo & payment history','Correct a recorded payment or undo a mistake.'],firstWin:['Your first win with Annie','One payday. One bill. One useful next step.'],quiet:['Quiet Mode','Your reminders, your pace, your privacy.']};
const tileColors={payday:{backgroundColor:'#FFE34F',borderColor:'#E5B900',color:'#0B1F40'},history:{backgroundColor:'#7842D2',borderColor:'#6027B8',color:'#FFFFFF'},firstWin:{backgroundColor:'#FF7EB5',borderColor:'#E64D92',color:'#0B1F40'},quiet:{backgroundColor:'#42D8CE',borderColor:'#16AAA0',color:'#0B1F40'}};
export function FeatureArtwork({source,style,testID}) {
  const [bounds,setBounds]=useState({width:0,height:0});
  return <View testID={testID} pointerEvents="none" style={[style,{overflow:'hidden'}]}
    onLayout={({nativeEvent:{layout}})=>setBounds(previous=>previous.width===layout.width&&previous.height===layout.height
      ? previous : {width:Math.max(0,layout.width),height:Math.max(0,layout.height)})}>
    {bounds.width>0&&bounds.height>0&&<Image source={source} resizeMode="contain" accessible={false}
      testID={`${testID}-image`} style={{position:'absolute',left:0,top:0,width:bounds.width,height:bounds.height}}/>}
  </View>;
}
export function EssentialsButtons({onOpen,reduceAnimation=false}) {
  return <View style={s.grid}>{Object.entries(captions).map(([key,[title,body]]) => <TouchableOpacity key={key} accessibilityRole="button" accessibilityLabel={`Open ${title}`} style={[s.tile,{backgroundColor:tileColors[key].backgroundColor,borderColor:tileColors[key].borderColor}]} onPress={() => onOpen(key)}>
    <FeatureArtwork source={essentialsArtwork[key]} style={s.art} testID={`feature-card-${key}`}/>
    <Text style={[s.tileTitle,{color:tileColors[key].color}]}>{title}</Text><Text style={[s.note,{color:tileColors[key].color}]}>{body}</Text>
  </TouchableOpacity>)}</View>;
}
const money=n=>`$${(n/100).toFixed(2)}`;
function Button({title,onPress,disabled=false}) {return <TouchableOpacity accessibilityRole="button" accessibilityLabel={title} disabled={disabled} style={[s.button,disabled&&{opacity:0.45}]} onPress={onPress}><Text style={s.buttonText}>{title}</Text></TouchableOpacity>;}
function Field({label,value,onChangeText,moneyField=false}) {return <View style={{gap:5}}><Text style={s.body}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} keyboardType={moneyField?'decimal-pad':'default'} style={s.input}/></View>;}
function Snapshot({finance,onChange}) {
  const snapshot=paydaySnapshot(finance);
  const [groceries,setGroceries]=useState(snapshot.essentialsSet?(snapshot.groceries/100).toFixed(2):'');
  const [gas,setGas]=useState(snapshot.essentialsSet?(snapshot.gas/100).toFixed(2):'');
  const [balance,setBalance]=useState(String(finance.balance??''));
  const [payday,setPayday]=useState(finance.nextPaycheckDate||'');
  const [message,setMessage]=useState('');
  function save() {try {
    const groceriesCents=moneyCents(groceries),gasCents=moneyCents(gas),balanceCents=moneyCents(balance,{signed:true});
    if(!paydaySnapshot({...finance,nextPaycheckDate:payday}).validPayday)throw new Error('Choose today or a future payday using YYYY-MM-DD.');
    onChange(current=>({...current,nextPaycheckDate:payday,daysUntilPayday:paydaySnapshot({...current,nextPaycheckDate:payday}).days,
      balance:balanceCents/100,balanceUpdatedAt:Date.now(),balanceSource:'Manual entry',paydayEssentials:{payday,groceriesCents,gasCents}}));setMessage('Your payday plan is saved.');
  }catch(e){setMessage(e.message);}}
  return <View style={s.section}>
    <Text style={s.body}>A planning estimate based on the information you enter. Your next paycheck is excluded until it arrives.</Text>
    {snapshot.validPayday ? <>
      <Text style={s.title}>{snapshot.remaining<0?'Estimated shortfall':'Estimated remaining'}: {money(Math.abs(snapshot.remaining))}</Text>
      <Text style={s.body}>Through {finance.nextPaycheckDate}, including bills due on payday.</Text>
      {!snapshot.essentialsSet&&<Text style={s.warning}>Add groceries and gas below—even if either is zero. This estimate is incomplete until you do.</Text>}
      <View style={s.calculation}>
        {[['Current entered balance',snapshot.balance],['Unpaid bills through payday',-snapshot.billTotal],['Debt minimums reserved',-snapshot.debt],['Planned groceries',-snapshot.groceries],['Planned gas',-snapshot.gas],['Protected buffer',-snapshot.buffer],['Estimated remaining',snapshot.remaining]].map(([label,amount])=><Text key={label} style={s.body}>{label}: {money(amount)}</Text>)}
      </View>
      <Text style={s.note}>Debt dates are not recorded, so all active debt minimums are reserved conservatively. Overdue unpaid bills are included. Recording a payment does not change your entered balance; update the balance after money leaves your account.</Text>
      {snapshot.unknownDates>0&&<Text style={s.warning}>{snapshot.unknownDates} unpaid bill(s) have no valid date. Their full amounts are reserved until you correct the dates.</Text>}
      <Text style={s.tileTitle}>Bills included</Text>
      {snapshot.bills.length?snapshot.bills.map(b=><Text key={b.id} style={s.body}>{b.name}: {money(Math.round(Number(b.amount)*100))} · {b.dueDate||b.due||'Date needed'}</Text>):<Text style={s.body}>No entered unpaid bills are due through this payday.</Text>}
    </>:<Text style={s.warning}>Enter a current payday below to calculate this snapshot.</Text>}
    <Text style={s.note}>Balance updated: {snapshot.updatedAt?new Date(snapshot.updatedAt).toLocaleString():'Unknown—confirm your balance below.'} · {finance.balanceSource||'Entered on this device; not bank-synced'}</Text>
    <Field label="Current bank balance" value={balance} onChangeText={setBalance} moneyField/>
    <Field label="Next payday (YYYY-MM-DD)" value={payday} onChangeText={setPayday}/>
    <Field label="Groceries planned through payday" value={groceries} onChangeText={setGroceries} moneyField/>
    <Field label="Gas planned through payday" value={gas} onChangeText={setGas} moneyField/>
    <Button title="Save payday plan" onPress={save}/><Text accessibilityLiveRegion="polite" style={s.note}>{message}</Text>
  </View>;
}
function History({finance,onUndo,onCorrect}) {
  const [editing,setEditing]=useState(null),[amount,setAmount]=useState(''),[message,setMessage]=useState('');
  function correct(){try{const value=moneyCents(amount);if(value<=0)throw new Error('Enter an amount greater than zero.');onCorrect(editing,value/100);setEditing(null);setMessage('Correction recorded. Your bank balance was not changed.');}catch(e){setMessage(e.message);}}
  return <View style={s.section}>
    <Text style={s.body}>These are records of payments made outside PayPlace. This screen does not send money or reverse a bank payment.</Text>
    <Text style={s.note}>History begins with this update. Existing paid bills remain paid; previous payment times are unknown.</Text>
    {!(finance.paymentHistory||[]).length&&<Text style={s.body}>No changes recorded yet. Record a payment from Bills to start your history.</Text>}
    {[...(finance.paymentHistory||[])].reverse().map(event=><View key={event.id} style={s.calculation}>
      <Text style={s.tileTitle}>{event.name} · {event.undoOf?'Undid a record change':event.kind==='recorded'?'Payment recorded':event.kind==='unmarked'?'Payment unmarked':'Amount corrected'}</Text>
      <Text style={s.note}>{new Date(event.at).toLocaleString()}</Text>
      <Text style={s.body}>{event.before.paid?'Paid':'Unpaid'} {money(Math.round(Number(event.before.amount)*100))} → {event.after.paid?'Paid':'Unpaid'} {money(Math.round(Number(event.after.amount)*100))}</Text>
      {canUndoPayment(finance,event)&&<Button title={`Undo record change for ${event.name}`} onPress={()=>onUndo(event.id)}/>}
    </View>)}
    <Text style={s.tileTitle}>Correct a recorded amount</Text>
    {(finance.bills||[]).filter(b=>b.paid||b.status==='Paid').map(b=><Button key={b.id} title={`Correct amount for ${b.name}`} onPress={()=>{setEditing(b.id);setAmount(String(b.amount));}}/>)}
    {editing&&<><Field label="Corrected payment amount" value={amount} onChangeText={setAmount} moneyField/><Button title="Save payment correction" onPress={correct}/><Button title="Cancel correction" onPress={()=>setEditing(null)}/></>}
    <Text accessibilityLiveRegion="polite" style={s.note}>{message}</Text>
  </View>;
}
function FirstWin({finance,onFirstWin,onSample,onPersonal}) {
  const [entry,setEntry]=useState({payday:finance.nextPaycheckDate||'',balance:String(finance.balance??''),name:'',amount:'',due:''}),[message,setMessage]=useState('');
  return <View style={s.section}>
    <Text style={s.body}>Sweetheart, let’s start with your next payday and just one bill. Add your current balance so we can show what that bill leaves. — Annie</Text>
    {finance.planSource==='Sample'?<><Text style={s.warning}>SAMPLE NEIGHBORHOOD · Fictional amounts. This is separate from your personal plan.</Text><Button title="Return to my personal plan" onPress={onPersonal}/></>:<>
    {finance.firstWinComplete&&<Text style={s.note}>You have already taken your first step. You can add another bill here without replacing your existing plan.</Text>}
    {[["payday","Next payday (YYYY-MM-DD)"],["balance","Current bank balance"],["name","First bill name"],["amount","First bill amount"],["due","Bill due date (YYYY-MM-DD)"]].map(([key,label])=><Field key={key} label={label} value={entry[key]} moneyField={key==='balance'||key==='amount'} onChangeText={text=>setEntry({...entry,[key]:text})}/>)}
    <Button title="Show my first payday plan" onPress={()=>{try{onFirstWin(entry);}catch(e){setMessage(e.message);}}}/>
    <Text accessibilityLiveRegion="polite" style={s.note}>{message}</Text>
    <Button title="Explore the sample neighborhood" onPress={onSample}/>
    <Text style={s.note}>Samples stay separate. Your saved personal plan will be here when you return.</Text>
    </>}
  </View>;
}
function Quiet({finance,onChange}) {
  const settings=quietSettings(finance.quietMode),[time,setTime]=useState(`${String(settings.hour??17).padStart(2,'0')}:${String(settings.minute).padStart(2,'0')}`),[message,setMessage]=useState('');
  return <View style={s.section}>
    <Text style={s.body}>Choose what feels comfortable. These preferences are saved on this device.</Text>
    {[["pauseCheckIns","Pause Annie’s weekly and absence check-ins"],["reduceAnimation","Reduce neighborhood animation"],["hideAmounts","Hide dollar amounts"]].map(([key,label])=><TouchableOpacity key={key} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{checked:settings[key]}} style={s.calculation} onPress={()=>onChange(current=>({...current,quietMode:{...quietSettings(current.quietMode),[key]:!settings[key]}}))}><Text style={s.tileTitle}>{label}: {settings[key]?'On':'Off'}</Text></TouchableOpacity>)}
    <Field label="Reminder time (24-hour HH:MM, local time)" value={time} onChangeText={setTime}/>
    <Button title="Save reminder time" onPress={()=>{if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)){setMessage('Use a time from 00:00 to 23:59.');return;}const [hour,minute]=time.split(':').map(Number);onChange(current=>({...current,quietMode:{...quietSettings(current.quietMode),hour,minute}}));setMessage('Time saved for enabled bill, subscription and Annie reminders.');}}/>
    <Text style={s.note}>Choosing a time does not enable notifications. Pausing check-ins keeps your bill and subscription reminders as you set them. Amount privacy hides displayed dollar values and masks money entry fields; it does not replace your app lock. Device Reduce Motion also stays respected.</Text>
    <Text accessibilityLiveRegion="polite" style={s.note}>{message}</Text>
  </View>;
}
export default function LaunchEssentials({panel,onClose,finance,onChange,onUndo,onCorrect,onFirstWin,onSample,onPersonal}) {
  return <Modal visible={!!panel} animationType={finance.quietMode?.reduceAnimation?'none':'slide'} onRequestClose={onClose}>
    {panel&&<ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Button title="Back to neighborhood" onPress={onClose}/><PayPlaceBrand/>
      <FeatureArtwork source={essentialsArtwork[panel]} style={s.hero} testID={`feature-hero-${panel}`}/>
      <Text style={s.title}>{captions[panel][0]}</Text>
      {panel==='payday'&&<Snapshot finance={finance} onChange={onChange}/>}
      {panel==='history'&&<History finance={finance} onUndo={onUndo} onCorrect={onCorrect}/>}
      {panel==='firstWin'&&<FirstWin finance={finance} onFirstWin={onFirstWin} onSample={onSample} onPersonal={onPersonal}/>}
      {panel==='quiet'&&<Quiet finance={finance} onChange={onChange}/>}
    </ScrollView>}
  </Modal>;
}
const s=StyleSheet.create({page:{padding:20,paddingTop:55,paddingBottom:50,gap:16,backgroundColor:'#F6FBFF'},grid:{flexDirection:'row',flexWrap:'wrap',gap:12,marginVertical:12},tile:{width:'47%',flexGrow:1,flexShrink:1,minWidth:0,overflow:'hidden',backgroundColor:'white',borderRadius:20,padding:10,gap:7,borderWidth:1,borderColor:'#DDEAF4'},art:{width:'100%',aspectRatio:3/2,maxHeight:112,borderRadius:14},hero:{width:'100%',aspectRatio:3/2,maxHeight:220,borderRadius:20},title:{fontSize:24,fontWeight:'900',color:'#0B1F40'},tileTitle:{fontSize:16,fontWeight:'800',color:'#0B1F40'},body:{fontSize:16,lineHeight:24,color:'#34465E'},note:{fontSize:13,lineHeight:20,color:'#43546B'},warning:{fontSize:15,lineHeight:22,color:'#884300',backgroundColor:'#FFF1CC',padding:12,borderRadius:12},section:{gap:14},calculation:{gap:8,padding:14,backgroundColor:'#EEE9FF',borderRadius:14},button:{backgroundColor:'#6754C5',padding:14,borderRadius:14,minHeight:48},buttonText:{color:'white',fontWeight:'800'},input:{borderWidth:1,borderColor:'#BACBD8',borderRadius:12,padding:12,fontSize:18,backgroundColor:'white'}});
