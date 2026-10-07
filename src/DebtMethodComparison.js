import React from "react";
import { StyleSheet, Text, View } from "react-native";
export default function DebtMethodComparison() {
  return <View style={s.card}>
    <Text accessibilityRole="header" style={s.title}>Avalanche with a chance of snowballs</Text>
    <View style={[s.method, { backgroundColor: "#E8F2FF" }]}><Text style={s.name}>Snowball · Quick wins first</Text><Text style={s.body}>Start with your smallest balance. Once it is paid off, roll its payment into the next smallest debt.</Text></View>
    <View style={[s.method, { backgroundColor: "#EDE6FF" }]}><Text style={s.name}>Mixed · Best of both</Text><Text style={s.body}>Get one small payoff win, then aim the extra payment at the highest APR. Your first target stays the same while you work on it.</Text></View>
    <View style={[s.method, { backgroundColor: "#DDF8F5" }]}><Text style={s.name}>Avalanche · Save more on interest</Text><Text style={s.body}>Start with the highest interest rate, then move down through the remaining APRs.</Text></View>
    <Text style={s.note}>With every method, keep paying the minimums on all debts. Mixed balances motivation and interest savings; it does not promise the lowest total interest.</Text>
  </View>;
}
const s = StyleSheet.create({ card: { marginTop: 14, padding: 14, backgroundColor: "#FFFFFF", borderRadius: 20 }, title: { color: "#173557", fontSize: 19, fontWeight: "900", lineHeight: 26 }, method: { padding: 13, borderRadius: 15, marginTop: 10 }, name: { color: "#173557", fontSize: 15, fontWeight: "800", lineHeight: 22 }, body: { color: "#394860", fontSize: 14, lineHeight: 21, marginTop: 5 }, note: { color: "#536077", fontSize: 13, lineHeight: 20, marginTop: 12 } });
