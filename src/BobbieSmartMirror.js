import React, { useEffect, useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { checkPurchase, mirrorBudget, parseAmount } from "./smart-mirror.mjs";

// Dave locked this exact room, tabby face, outfit and rear-view reflection.
const room = require("../assets/characters/bobbie-smart-mirror.png");
const inkFont = Platform.select({ ios: "Noteworthy", android: "sans-serif", web: "cursive" });
const tabs = [
  { id: "check", label: "Can I afford this?", color: "#AC226B", tilt: "-2deg" },
  { id: "treat", label: "Treat yourself", color: "#096D66", tilt: "2deg" },
  { id: "balance", label: "My fun money", color: "#6341AF", tilt: "-1deg" },
  { id: "looks", label: "My looks", color: "#855516", tilt: "2deg" },
];
const dollars = (value) => `$${Number(value || 0).toFixed(2)}`;

function Field({ label, value, onChangeText, placeholder, money = false, ...props }) {
  return <View style={s.field}>
    <Text style={s.label}>{label}</Text>
    <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText}
      placeholder={placeholder} placeholderTextColor="#86788A" style={s.input}
      keyboardType={money ? "decimal-pad" : "default"} maxLength={money ? 18 : 120} {...props} />
  </View>;
}

function Button({ children, onPress, disabled = false, secondary = false }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }}
    onPress={onPress} disabled={disabled} style={[s.button, secondary && s.secondary, disabled && s.disabled]}>
    <Text style={[s.buttonText, secondary && s.secondaryText]}>{children}</Text>
  </TouchableOpacity>;
}

export default function BobbieSmartMirror({ finance, onAction, onBudget }) {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState("check");
  const [purchaseName, setPurchaseName] = useState("");
  const [cost, setCost] = useState("");
  const [checked, setChecked] = useState(false);
  const [limit, setLimit] = useState("");
  const [message, setMessage] = useState("");
  const [look, setLook] = useState({ name: "", wig: "Ice blonde curls", outfit: "Yellow plaid & white boots", accessories: "Pearls, diamonds & a matching bag" });
  const recording = useRef(false);
  const budget = mirrorBudget(finance);
  const purchase = checked ? checkPurchase(finance, cost) : null;
  const validCost = parseAmount(cost);
  const parsedLimit = parseAmount(limit);
  const limitFits = parsedLimit !== null && parsedLimit >= budget.spent &&
    Math.round((parsedLimit - budget.spent) * 100) <= Math.round(budget.available * 100);

  useEffect(() => {
    if (visible) { setLimit(budget.hasPlan ? String(budget.limit) : ""); setMessage(""); }
  }, [visible]);

  function chooseTab(id) { setTab(id); setMessage(""); }
  function visitBudget() { setVisible(false); onBudget(); }
  function recordPurchase() {
    if (recording.current || !purchase?.fitsFunMoney) return;
    recording.current = true;
    try {
      if (onAction({ type: "record", amount: cost, name: purchaseName })) {
        setMessage(`${purchaseName.trim() || "Your treat"} recorded. Your local balance and fun money are updated.`);
        setCost(""); setPurchaseName(""); setChecked(false);
      }
    } finally { recording.current = false; }
  }

  return <>
    <TouchableOpacity testID="bobbie-smart-mirror" accessibilityRole="button"
      accessibilityLabel="Visit Bobbie's house and smart mirror" activeOpacity={0.92}
      onPress={() => setVisible(true)} style={s.visitCard}>
      <Image source={room} resizeMode="contain" style={s.thumbnail} accessibilityLabel="Bobbie in her gold smart mirror room, with blonde curls, yellow plaid and white boots" />
      <View style={s.visitCopy}>
        <Text style={[s.eyebrow, { color: "#F6C3DA" }]}>BOBBIE’S HOUSE</Text>
        <Text style={s.visitTitle}>A little reflection.</Text>
        <Text style={s.visitBody}>Plan a purchase. Make room for joy.</Text>
        <Text style={s.visitLink}>Visit her smart mirror →</Text>
      </View>
    </TouchableOpacity>

    <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={s.header}>
            <View style={{ flex: 1 }}><Text style={s.eyebrow}>WELCOME TO BOBBIE’S HOUSE</Text><Text style={s.title}>The Smart Mirror</Text></View>
            <TouchableOpacity testID="close-smart-mirror" accessibilityRole="button" accessibilityLabel="Close Bobbie's smart mirror"
              style={s.close} onPress={() => setVisible(false)}><Ionicons name="close" size={25} color="#493349" /></TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.scroll}>
            <View style={s.roomFrame}><Image source={room} style={s.room} resizeMode="contain"
              accessibilityLabel="Bobbie's approved Cher-inspired bedroom, wigs on white cat mannequins, and gold mirror showing the back of her head" /></View>
            <View style={s.mirror}>
              <Image source={room} resizeMode="cover" style={s.reflection} accessible={false} />
              <View style={s.inkNotes}>
                <Text style={[s.scribble, s.quotePink]}>You are allowed to want nice things. ♡</Text>
                <Text style={[s.scribble, s.quoteTeal]}>Confidence is always in season.</Text>
                <Text style={[s.scribble, s.quotePurple]}>Same cat. Different slay.</Text>
              </View>
              <View style={s.tabs} accessibilityRole="tablist">
                {tabs.map((item) => <TouchableOpacity key={item.id} testID={`mirror-tab-${item.id}`}
                  accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: tab === item.id }}
                  onPress={() => chooseTab(item.id)} style={[s.tab, { transform: [{ rotate: item.tilt }] }, tab === item.id && { borderColor: item.color, backgroundColor: "#FFFFFFE8" }]}>
                  <Text style={[s.scribble, s.tabLabel, { color: item.color }]}>{item.label}</Text>
                </TouchableOpacity>)}
              </View>
              <View style={s.panel}>
                {tab === "check" && <>
                  <Text style={s.panelTitle}>Can I afford this?</Text>
                  <Text style={s.body}>An outfit, dinner, a trip, a little something. Let’s give it a place in your plan.</Text>
                  <Field label="What are you thinking about?" value={purchaseName} onChangeText={(text) => { setPurchaseName(text); setMessage(""); }} placeholder="Dinner out, a new outfit…" />
                  <Field label="Full cost, including tax and fees" value={cost} money placeholder="0.00"
                    onChangeText={(text) => { setCost(text); setChecked(false); setMessage(""); }} />
                  {cost !== "" && validCost === null && <Text style={s.error}>Enter a valid amount with up to two decimal places.</Text>}
                  <Button disabled={validCost === null || validCost <= 0} onPress={() => { setChecked(true); setMessage(""); }}>Ask the mirror</Button>
                  {purchase && <View accessibilityLiveRegion="polite" style={[s.result, !purchase.fits && s.resultAmber]}>
                    <Text style={s.resultTitle}>{purchase.fits ? "There’s room in your current plan." : "Let’s give this a little more time."}</Text>
                    <Text style={s.body}>{purchase.fits
                      ? `${dollars(purchase.amount)} leaves ${dollars(purchase.left)} after your saved bills, debt minimums and buffer.`
                      : `You have ${dollars(budget.available)} available now. You’d need ${dollars(purchase.shortfall)} more to protect your saved bills, debt minimums and buffer.`}</Text>
                    <Text style={[s.scribble, s.resultNote]}>{purchase.fits ? "Joy belongs in your budget, darling." : "A pause is a plan. Your worth hasn’t changed."}</Text>
                    {purchase.fitsFunMoney && <Button onPress={recordPurchase}>Record this treat in my fun money</Button>}
                    {purchase.fits && !budget.hasPlan && <Button secondary onPress={() => chooseTab("treat")}>Make a fun-money plan</Button>}
                    {!purchase.fits && <Button secondary onPress={visitBudget}>Review my numbers</Button>}
                  </View>}
                </>}

                {tab === "treat" && <>
                  <Text style={s.panelTitle}>Treat Yourself, Responsibly</Text>
                  <Text style={s.body}>Choose a guilt-free amount from the money left after your bills, debt minimums and buffer.</Text>
                  <View style={s.amountCard}><Text style={s.label}>Available in your current budget</Text><Text style={s.amount}>{dollars(budget.available)}</Text></View>
                  <Field label="Total fun-money plan" value={limit} money placeholder="0.00" onChangeText={(text) => { setLimit(text); setMessage(""); }} />
                  {budget.spent > 0 && <Text style={s.small}>{dollars(budget.spent)} already recorded is included in this total.</Text>}
                  {limit !== "" && !limitFits && <Text style={s.error}>{parsedLimit === null ? "Enter a valid amount with up to two decimal places." : parsedLimit < budget.spent ? "Include the treats already recorded in your total." : "Try a smaller amount so your saved essentials stay covered."}</Text>}
                  <Button disabled={!limitFits} onPress={() => {
                    if (onAction({ type: "save", amount: limit })) setMessage("Your fun-money plan is saved. Enjoy it without the guilt spiral. ♡");
                  }}>Save my fun-money plan</Button>
                  <Text style={s.small}>This sets aside part of your current balance. It doesn’t add money to your budget.</Text>
                </>}

                {tab === "balance" && <>
                  <Text style={s.panelTitle}>Check my fun-money balance</Text>
                  {budget.hasPlan ? <>
                    <View style={s.amountCard}><Text style={s.label}>Fun money left in this plan</Text><Text style={s.amount}>{dollars(budget.remaining)}</Text>
                      <Text style={s.small}>{dollars(budget.limit)} planned · {dollars(budget.spent)} recorded</Text></View>
                    {budget.usableFunMoney < budget.remaining && <Text style={s.body}>{dollars(budget.usableFunMoney)} fits your current budget. Review your numbers before your next treat.</Text>}
                    {budget.paydayChanged && <Text style={s.body}>Your payday changed. Review this plan for your new pay period.</Text>}
                    <Button secondary onPress={() => chooseTab("check")}>Check my next treat</Button>
                    <Button secondary onPress={() => chooseTab("treat")}>Adjust my plan</Button>
                    {budget.entries.length > 0 && <Text style={s.label}>Your recorded treats</Text>}
                    {budget.entries.slice().reverse().map((entry) => <View key={entry.id} style={s.entry}>
                      <View style={{ flex: 1 }}><Text style={s.label}>{entry.name}</Text><Text style={s.small}>{dollars(entry.amount)}</Text></View>
                      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Undo ${entry.name}`}
                        style={s.undo} onPress={() => { if (onAction({ type: "undo", id: entry.id })) setMessage("Treat undone. Your local balance and fun money are restored."); }}>
                        <Text style={s.undoText}>Undo</Text>
                      </TouchableOpacity>
                    </View>)}
                  </> : <><Text style={s.body}>Your joy deserves a little room. Set a fun-money amount first, and it will live here.</Text><Button onPress={() => chooseTab("treat")}>Make my fun-money plan</Button></>}
                  <Text style={s.small}>Recording a treat reduces the balance you entered in PayPlace. Use it for purchases you haven’t already deducted there.</Text>
                </>}

                {tab === "looks" && <>
                  <Text style={s.panelTitle}>Design a look</Text>
                  <Text style={s.body}>Plan the wig, outfit and finishing touches. Bobbie keeps your ideas here as saved look plans.</Text>
                  <Field label="Name your look" value={look.name} onChangeText={(name) => setLook({ ...look, name })} placeholder="Tuesday’s main character moment" />
                  <Field label="Wig or hairstyle" value={look.wig} onChangeText={(wig) => setLook({ ...look, wig })} />
                  <Field label="Outfit and shoes" value={look.outfit} onChangeText={(outfit) => setLook({ ...look, outfit })} />
                  <Field label="Jewelry, nails and accessories" value={look.accessories} onChangeText={(accessories) => setLook({ ...look, accessories })} />
                  <Button disabled={!look.name.trim()} onPress={() => { if (onAction({ type: "look", look })) { setMessage("Look plan saved. Same cat, different slay. ♡"); setLook({ ...look, name: "" }); } }}>Save my look plan</Button>
                  {(finance.bobbieLooks || []).map((saved) => <View key={saved.id} style={s.look}>
                    <Text style={[s.scribble, s.lookName]}>{saved.name}</Text><Text style={s.body}>{[saved.wig, saved.outfit, saved.accessories].filter(Boolean).join(" · ")}</Text>
                  </View>)}
                </>}
                {message !== "" && <Text accessibilityLiveRegion="polite" style={s.success}>{message}</Text>}
                <View style={s.breakdown}>
                  <Text style={s.label}>The numbers in your mirror</Text>
                  {[["Current balance", budget.balance], ["Unpaid bills", budget.bills], ["Debt minimums", budget.debt], ["Protected buffer", budget.buffer]].map(([label, value]) => <View key={label} style={s.row}><Text style={s.small}>{label}</Text><Text style={s.small}>{dollars(value)}</Text></View>)}
                  <Button secondary onPress={visitBudget}>Edit my budget</Button>
                  <Text style={s.small}>Based on your entries in PayPlace. Early-preview numbers are samples until you replace them. No money moves through the mirror.</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  </>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF7F3" },
  visitCard: { flexDirection: "row", backgroundColor: "#31203E", borderRadius: 24, borderWidth: 2, borderColor: "#D8AD64", overflow: "hidden", marginTop: 14, marginBottom: 12 },
  thumbnail: { width: 108, height: 144, backgroundColor: "#EDD0BC" },
  visitCopy: { flex: 1, padding: 14, justifyContent: "center" },
  eyebrow: { color: "#985B22", fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  visitTitle: { color: "#FFFFFF", fontSize: 21, fontWeight: "800", marginTop: 5 },
  visitBody: { color: "#F8E5EF", fontSize: 13, lineHeight: 19, marginTop: 5 },
  visitLink: { color: "#FFD696", fontSize: 13, fontWeight: "800", marginTop: 10 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#EACDA4" },
  title: { color: "#493349", fontSize: 26, fontWeight: "800", marginTop: 3 },
  close: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 23, backgroundColor: "#F5E3E9" },
  scroll: { padding: 16, paddingBottom: 40 },
  roomFrame: { height: 280, borderWidth: 4, borderColor: "#CCA466", borderRadius: 30, overflow: "hidden", backgroundColor: "#F9DFCC", marginBottom: 16 },
  room: { width: "100%", height: "100%" },
  mirror: { backgroundColor: "#FFFDF9", borderWidth: 4, borderColor: "#CCA466", borderRadius: 30, overflow: "hidden" },
  reflection: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%", opacity: 0.07 },
  inkNotes: { padding: 18, gap: 9 },
  scribble: { fontFamily: inkFont, fontSize: 17, fontWeight: "600" },
  quotePink: { color: "#AC226B", transform: [{ rotate: "-2deg" }] },
  quoteTeal: { color: "#096D66", textAlign: "right", transform: [{ rotate: "2deg" }] },
  quotePurple: { color: "#6341AF", textAlign: "center", transform: [{ rotate: "-1deg" }] },
  tabs: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  tab: { flexGrow: 1, flexBasis: "44%", minHeight: 54, justifyContent: "center", alignItems: "center", borderRadius: 13, paddingHorizontal: 6, paddingVertical: 8, borderWidth: 2, borderColor: "transparent" },
  tabLabel: { fontSize: 17, textAlign: "center" },
  panel: { padding: 18, backgroundColor: "#FFFFFFDF", borderTopWidth: 1, borderColor: "#E9D6BD" },
  panelTitle: { color: "#493349", fontSize: 23, lineHeight: 30, fontWeight: "800", marginBottom: 9 },
  body: { color: "#5A485E", fontSize: 15, lineHeight: 23 },
  field: { marginTop: 17 },
  label: { color: "#493349", fontSize: 14, fontWeight: "700", marginBottom: 7 },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#CFBACD", borderRadius: 14, paddingHorizontal: 13, paddingVertical: 12, color: "#493349", backgroundColor: "#FFFFFF", fontSize: 16 },
  button: { minHeight: 50, backgroundColor: "#96345F", borderRadius: 15, padding: 13, alignItems: "center", justifyContent: "center", marginTop: 15 },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", textAlign: "center" },
  secondary: { backgroundColor: "#F2E9F5", borderWidth: 1, borderColor: "#D2BBDF" },
  secondaryText: { color: "#563278" }, disabled: { opacity: 0.45 },
  result: { backgroundColor: "#EFF8F0", borderRadius: 18, padding: 15, borderWidth: 1, borderColor: "#B9D8BD", marginTop: 18 },
  resultAmber: { backgroundColor: "#FFF7E5", borderColor: "#DFCA95" },
  resultTitle: { color: "#493349", fontSize: 18, lineHeight: 25, fontWeight: "800", marginBottom: 7 },
  resultNote: { color: "#6341AF", marginTop: 12, lineHeight: 25 },
  amountCard: { backgroundColor: "#F9F1E7", borderRadius: 18, padding: 17, marginTop: 16 },
  amount: { color: "#684793", fontSize: 34, fontWeight: "800" },
  small: { color: "#706274", fontSize: 12, lineHeight: 18, marginTop: 6 },
  error: { color: "#96345F", fontSize: 13, lineHeight: 19, marginTop: 10 },
  success: { color: "#176650", fontSize: 14, lineHeight: 22, fontWeight: "600", marginTop: 17 },
  entry: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: "#E6DCE8", paddingVertical: 12, gap: 10 },
  undo: { minHeight: 44, paddingHorizontal: 12, justifyContent: "center" }, undoText: { color: "#6341AF", fontWeight: "700", fontSize: 14 },
  look: { padding: 14, borderRadius: 16, backgroundColor: "#F6EDF7", marginTop: 14 },
  lookName: { color: "#AC226B", fontSize: 20, marginBottom: 6 },
  breakdown: { marginTop: 24, borderTopWidth: 1, borderColor: "#E6DCE8", paddingTop: 17 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
});
