import React, { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ExtraPaycheckChapoScene from "./ExtraPaycheckChapoScene";
import { buildCalendar, dateKey, readDate, suggestedSplit } from "./paycheck-calendar.mjs";
import { parseAmount } from "./smart-mirror.mjs";

const dollars = value => `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const parts = { bills: "Catch-up bills", debt: "Debt", buffer: "Buffer", joy: "Guilt-free joy" };
function Button({ label, onPress, secondary, disabled }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={[s.button, secondary && s.secondary, disabled && { opacity: 0.4 }]}><Text style={[s.buttonText, secondary && { color: "#5935B5" }]}>{label}</Text></TouchableOpacity>;
}
function Field({ label, value, onChangeText, money }) {
  return <View style={{ marginTop: 12 }}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} style={s.input} value={String(value)} onChangeText={onChangeText}
    onBlur={money ? () => { const amount = parseAmount(value); if (amount !== null) onChangeText(amount.toFixed(2)); } : undefined}
    keyboardType={money ? "decimal-pad" : "default"} /></View>;
}
export default function ExtraPaycheckCalendar({ visible, onClose, finance, onAction, onBudget, upcomingTotal }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12));
  const [selected, setSelected] = useState("");
  const [bonusOpen, setBonusOpen] = useState(false);
  const [bonus, setBonus] = useState({ date: "", amount: "", label: "Bonus check" });
  const [split, setSplit] = useState({});
  const [notice, setNotice] = useState("");
  const { events, settings, configured } = useMemo(() => buildCalendar(finance, month), [finance, month]);
  const event = events.find(item => item.id === selected);
  const saved = event && finance.extraPaycheckPlans?.[event.id];
  const savingsChanged = saved && Number(saved.amount) !== event.amount;
  const selectedKey = event?.id || "";
  useEffect(() => {
    setSplit(event ? (saved?.split || suggestedSplit(event.amount, upcomingTotal)) : {});
  }, [selectedKey, event?.amount, saved, upcomingTotal]);
  const extras = events.filter(item => item.extra);
  const firstWeekday = month.getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((firstWeekday + days) / 7) * 7 }, (_, i) => i - firstWeekday + 1);
  const allocated = Object.values(split).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const changeMonth = delta => {
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12));
    setSelected(""); setBonusOpen(false); setNotice("");
  };
  function saveBonus() {
    if (onAction({ type: "bonus", entry: { ...bonus, id: `bonus-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` } })) {
      const date = readDate(bonus.date);
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1, 12));
      setBonusOpen(false); setBonus({ date: "", amount: "", label: "Bonus check" }); setNotice("Extra check added to your calendar.");
    }
  }
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.header}><View style={{ flex: 1 }}><Text style={s.eyebrow}>PAYPLACE PAID FEATURES · BETA PREVIEW</Text><Text style={s.title}>Extra Paycheck Calendar</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Close extra paycheck calendar" style={s.close} onPress={onClose}><Ionicons name="close" size={26} color="#17213C" /></TouchableOpacity></View>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Text style={s.body}>See your paydays, spot an extra check, and give it a plan before Chapo fills his BellyBox cart.</Text>
        <View style={s.scene}><ExtraPaycheckChapoScene /></View>
        <Text style={s.note}>Included for beta testing. This preview does not start a subscription or charge you.</Text>
        {!configured && <View style={s.card}><Text style={s.subtitle}>Set your pay rhythm</Text><Text style={s.body}>Add a valid next payday date in Budget to fill your calendar. You can add a bonus check below at any time.</Text><Button label="Set up in Budget" onPress={onBudget} /></View>}
        <View style={s.card}>
          <View style={s.row}><Button label="Previous month" secondary onPress={() => changeMonth(-1)} /><Button label="Next month" secondary onPress={() => changeMonth(1)} /></View>
          <Text accessibilityRole="header" style={s.subtitle}>{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</Text>
          <Text style={s.note}>{settings.label} · {events.filter(item => item.type === "pay").length} scheduled checks</Text>
          <View style={s.row}><Text style={s.legend}>● Payday</Text><Text style={[s.legend, { color: "#744000" }]}>★ Extra check</Text></View>
          <View style={s.grid}>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <Text key={day} style={s.weekday}>{day}</Text>)}</View>
          <View style={s.grid}>{cells.map((day, i) => {
            if (day < 1 || day > days) return <View key={i} style={s.cell} />;
            const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day, 12));
            const checks = events.filter(item => item.date === key);
            const extra = checks.some(item => item.extra);
            return <TouchableOpacity key={i} accessibilityRole="button" accessibilityLabel={`${key}${checks.length ? `, ${checks.map(item => item.label).join(", ")}` : ", no paycheck"}`} disabled={!checks.length} onPress={() => { setSelected(checks.find(item => item.extra)?.id || checks[0].id); setBonusOpen(false); }} style={[s.cell, checks.length > 0 && s.payCell, extra && s.extraCell, event?.date === key && s.selectedCell]}><Text style={s.day}>{day}</Text><Text style={s.marker}>{extra ? "★" : checks.length ? "●" : ""}</Text></TouchableOpacity>;
          })}</View>
          <Text style={s.note}>{extras.length ? `${extras.length} extra check${extras.length === 1 ? "" : "s"} · ${dollars(extras.reduce((sum, item) => sum + item.amount, 0))} estimated` : "No extra checks this month."}</Text>
          <Text style={s.note}>Dates and amounts are estimates from your pay rhythm. Extra means a third biweekly check or fifth weekly check in a month, plus bonuses you add. Your bills still need covering.</Text>
          {settings.kind === "semi" && <Text style={s.note}>Twice-monthly paydays repeat on two calendar days. Set the second day (1–31; 31 means month end) in Budget if your employer uses a different schedule.</Text>}
        </View>
        {events.length > 0 && <View style={s.card}><Text style={s.subtitle}>This month’s checks</Text>{events.map(item => <TouchableOpacity accessibilityRole="button" key={item.id} onPress={() => { setSelected(item.id); setBonusOpen(false); }} style={[s.check, item.extra && { backgroundColor: "#FFF2BA" }]}><Text style={s.label}>{item.extra ? "★ " : ""}{item.label} · {readDate(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text><Text style={s.body}>{dollars(item.amount)}{finance.extraPaycheckPlans?.[item.id] ? " · Plan saved" : ""}</Text></TouchableOpacity>)}</View>}
        {event && <View style={s.card}>
          <Text style={s.subtitle}>{event.label} · {dollars(event.amount)}</Text><Text style={s.note}>{event.date}</Text>
          {event.amount > 0 ? <><Text style={s.body}>Cover catch-up bills, push debt, protect a buffer, then keep a little guilt-free joy. Adjust each part to fit your life.</Text>{savingsChanged && <Text style={s.warning}>Your paycheck estimate changed. Review and save this plan again.</Text>}{Object.entries(parts).map(([key, label]) => <Field key={key} label={label} money value={split[key] ?? "0"} onChangeText={value => { setSplit(current => ({ ...current, [key]: value })); setNotice(""); }} />)}<Text style={[s.label, { marginTop: 14, color: allocated > event.amount ? "#9F2525" : "#3A6A47" }]}>{dollars(Math.abs(event.amount - allocated))} {allocated > event.amount ? "over the check amount" : "left to assign"}</Text><Button label="Save this check’s plan" onPress={() => { if (onAction({ type: "split", event, values: split })) setNotice("Plan saved. Your balance and bills have not changed."); }} /><Text style={s.note}>Saving is planning only. It does not move money, pay bills, or add the check to Safe to Spend.</Text></> : <><Text style={s.body}>Add your paycheck amount in Budget to plan this check.</Text><Button label="Edit paycheck amount" onPress={onBudget} /></>}
          {event.type === "bonus" && <Button label="Remove this bonus check" secondary onPress={() => { onAction({ type: "removeBonus", id: event.id }); setSelected(""); }} />}
        </View>}
        <Button label={bonusOpen ? "Cancel adding check" : "Add an extra or bonus check"} secondary onPress={() => { setBonusOpen(!bonusOpen); setNotice(""); }} />
        {bonusOpen && <View style={s.card}><Text style={s.subtitle}>Add a check</Text><Field label="Date (YYYY-MM-DD)" value={bonus.date} onChangeText={date => setBonus(current => ({ ...current, date }))} /><Field label="Check amount" money value={bonus.amount} onChangeText={amount => setBonus(current => ({ ...current, amount }))} /><Field label="Name (bonus, overtime, or extra check)" value={bonus.label} onChangeText={label => setBonus(current => ({ ...current, label }))} /><Button label="Add to calendar" onPress={saveBonus} /></View>}
        {!!notice && <Text accessibilityLiveRegion="polite" style={s.success}>{notice}</Text>}
        <Button label="Done" onPress={onClose} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF9E8" }, header: { padding: 18, flexDirection: "row", alignItems: "center", gap: 8 }, content: { padding: 18, paddingTop: 0, paddingBottom: 40 },
  eyebrow: { color: "#5935B5", fontSize: 11, fontWeight: "900", marginBottom: 7 }, title: { color: "#17213C", fontSize: 25, fontWeight: "900" }, close: { padding: 10, minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" }, body: { color: "#394860", fontSize: 15, lineHeight: 22 }, note: { color: "#536077", fontSize: 13, lineHeight: 19, marginTop: 10 },
  card: { backgroundColor: "white", padding: 16, borderRadius: 24, borderColor: "#E7DDFC", borderWidth: 1, marginTop: 16 }, subtitle: { fontSize: 20, fontWeight: "900", color: "#17213C", marginTop: 8, marginBottom: 8 }, scene: { height: 190, borderRadius: 22, overflow: "hidden", marginTop: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }, legend: { color: "#5935B5", marginVertical: 12, fontWeight: "700" }, grid: { flexDirection: "row", flexWrap: "wrap" }, weekday: { width: "14.2857%", textAlign: "center", fontSize: 11, color: "#536077", paddingVertical: 8 },
  cell: { width: "14.2857%", minHeight: 52, borderWidth: 2, borderColor: "transparent", borderRadius: 10, alignItems: "center", justifyContent: "center" }, payCell: { backgroundColor: "#EDE5FF" }, extraCell: { backgroundColor: "#FFD65E" }, selectedCell: { borderColor: "#5935B5" }, day: { fontSize: 15, fontWeight: "800", color: "#17213C" }, marker: { fontSize: 13, height: 17, color: "#5935B5" },
  button: { backgroundColor: "#5935B5", padding: 14, borderRadius: 16, marginTop: 12, alignItems: "center", minHeight: 48 }, secondary: { backgroundColor: "#EEE6FF" }, buttonText: { color: "white", fontWeight: "800", fontSize: 14 }, label: { fontSize: 14, fontWeight: "800", color: "#17213C", marginBottom: 6 }, input: { backgroundColor: "#FAF8FF", borderWidth: 1, borderColor: "#D6C8ED", borderRadius: 14, padding: 12, fontSize: 16, color: "#17213C", minHeight: 48 }, check: { padding: 14, borderRadius: 16, backgroundColor: "#F4EFFF", marginTop: 10 }, warning: { color: "#9F2525", marginTop: 8, lineHeight: 20 }, success: { color: "#3A6A47", fontWeight: "800", paddingVertical: 16, lineHeight: 22 },
});
