import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import { weeklyRecap, smallTasks } from './neighborhood-progress.mjs';
import { requestBillReminderPermission } from './useBillReminders';
const money = n => `$${Number(n).toFixed(2)}`;
export function SmallSteps({ finance, onChange, onOpen }) {
  const tasks = smallTasks(finance);
  const day = new Date().toLocaleDateString('en-CA');
  const done = finance.smallSteps?.day === day ? finance.smallSteps.done || [] : [];
  return <View style={s.card}>
    <Image source={require('../assets/characters/tate-small-bites.png')} style={{width:'100%',aspectRatio:16/9,borderRadius:14}} resizeMode="contain" accessibilityLabel="Tate offers a tiny biscuit: One small bite at a time. One little task is enough to start." />
    <Text style={s.title}>One small step</Text><Text style={s.body}>Choose just one. Reviewing counts; you do not have to spend or save money to finish a task.</Text>
    {tasks.map(task => <View key={task.id} style={s.task}><Text style={s.body}>{task.title}{done.includes(task.id) ? ' · Done today' : ''}</Text>
      <View style={s.row}><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Open task: ${task.title}`} onPress={() => onOpen(task.target)} style={s.button}><Text style={s.buttonText}>Take a look</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${done.includes(task.id) ? 'Undo' : 'Complete'} task: ${task.title}`} onPress={() => onChange({ day, done:done.includes(task.id) ? done.filter(id => id !== task.id) : [...done,task.id] })} style={s.secondary}><Text style={s.secondaryText}>{done.includes(task.id) ? 'Undo' : 'Mark done'}</Text></TouchableOpacity></View></View>)}
    {done.length > 0 && <Text accessibilityLiveRegion="polite" style={s.kind}>You showed up. That counts. — Tate</Text>}
  </View>;
}
export default function NeighborCare({ finance, onChange, onSmallStep, onCalm, status }) {
  const recap = weeklyRecap(finance);
  const settings = finance.annieCare || {};
  const [hour,setHour] = useState(String(settings.hour ?? 17));
  const [message,setMessage] = useState('');
  const [showSettings,setShowSettings] = useState(false);
  const away = settings.returnedAfterWeek === true;
  async function toggle(key) {
    if (!settings[key] && !(await requestBillReminderPermission())) { setMessage('Allow notifications in your device settings to receive Annie’s check-ins.'); return; }
    onChange({...settings,[key]:!settings[key]});
  }
  return <View style={s.card}>
    <Text style={s.eyebrow}>YOUR WEEK WITH ANNIE</Text><Text style={s.title}>{away ? 'The porch light is still on' : 'Look at what you’ve tended'}</Text>
    <Text style={s.body}>{away ? 'Sweetheart, the neighborhood missed you. No catching up required. How are you doing?' : 'A little look at the past seven days, sweetheart. Every small step matters.'}</Text>
    <Text style={s.kind}>{recap.bills} bills marked paid · {money(recap.billAmount)}</Text>
    <Text style={s.body}>{recap.debts} debts recorded as paid off</Text><Text style={s.body}>{recap.subscriptions} subscriptions marked canceled · {money(recap.monthlySaved)} estimated monthly savings</Text>
    <Text style={s.kind}>{money(recap.savings)} added to your savings goals</Text>
    <Text style={s.note}>Based on changes you record after this update. Payments and transfers happen outside PayPlace. Premium sample activity is excluded. Cancellation savings are estimates, separate from money saved.</Text>
    <View style={s.row}><TouchableOpacity style={s.button} accessibilityRole="button" onPress={onSmallStep}><Text style={s.buttonText}>One small step</Text></TouchableOpacity><TouchableOpacity style={s.secondary} accessibilityRole="button" onPress={onCalm}><Text style={s.secondaryText}>Visit the Calm Garden</Text></TouchableOpacity></View>
    <TouchableOpacity style={s.secondary} accessibilityRole="button" accessibilityState={{expanded:showSettings}} onPress={() => setShowSettings(!showSettings)}><Text style={s.secondaryText}>{showSettings ? "Hide check-in settings" : "Annie’s check-in settings"}</Text></TouchableOpacity>
    {showSettings && <View style={{gap:10}}><Text style={s.title}>Annie’s quiet check-ins</Text><Text style={s.body}>Optional silent notifications. Choose an hour that works with your sleep schedule. Turning either option off pauses it.</Text>
    {[['weekly','Weekly recap reminder'],['checkIn','Check in after seven days away']].map(([key,label]) => <TouchableOpacity key={key} style={s.secondary} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{checked:settings[key] === true}} onPress={() => toggle(key)}><Text style={s.secondaryText}>{label}: {settings[key] ? 'On' : 'Off'}</Text></TouchableOpacity>)}
    <Text style={s.body}>Delivery hour in your local time (0–23)</Text><TextInput accessibilityLabel="Annie notification delivery hour" keyboardType="number-pad" value={hour} onChangeText={setHour} style={s.input} />
    <TouchableOpacity style={s.button} accessibilityRole="button" onPress={() => { if (!/^\d{1,2}$/.test(hour) || Number(hour)>23) {setMessage('Choose an hour from 0 to 23.');return;} onChange({...settings,hour:Number(hour)});setMessage('Annie’s delivery time saved.'); }}><Text style={s.buttonText}>Save delivery time</Text></TouchableOpacity>
    </View>}
    <Text accessibilityLiveRegion="polite" style={s.note}>{message || (status?.error ? 'Annie could not schedule notifications. Open PayPlace and try again.' : status?.supported === false ? 'Notifications are available in the installed mobile app.' : 'Check-ins contain no private financial totals on your lock screen.')}</Text>
  </View>;
}
const s=StyleSheet.create({card:{backgroundColor:'#FFFFFF',padding:18,borderRadius:22,gap:10,marginVertical:12},eyebrow:{color:'#6754C5',fontWeight:'900'},title:{fontSize:22,fontWeight:'900',color:'#0B1F40'},body:{fontSize:15,lineHeight:22,color:'#34465E'},kind:{fontSize:17,fontWeight:'800',color:'#087E76'},note:{fontSize:13,lineHeight:20,color:'#43546B'},row:{flexDirection:'row',flexWrap:'wrap',gap:8},task:{gap:8,paddingVertical:8},button:{backgroundColor:'#6754C5',padding:13,borderRadius:13,minHeight:48},buttonText:{color:'#FFFFFF',fontWeight:'800'},secondary:{backgroundColor:'#EDE9FF',padding:13,borderRadius:13,minHeight:48},secondaryText:{color:'#46349D',fontWeight:'800'},input:{borderWidth:1,borderColor:'#B9C7D4',borderRadius:12,padding:12,fontSize:18}});
