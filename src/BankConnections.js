import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Alert from "./alert";

// Bank linking is a future paid feature. Enable only for owner testing or after
// paid access is implemented on the server, as described in PLAID_SETUP.md.
const BANK_LINKING_UPCOMING = true;
let scriptPromise;
async function sdk() {
  if (window.Plaid) return window.Plaid;
  if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "payplace-plaid-script";
    script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.async = true;
    const timer = setTimeout(() => { script.remove(); scriptPromise = null; reject(new Error("Plaid took too long to load. Please try again.")); }, 20000);
    script.onload = () => { clearTimeout(timer); if (window.Plaid) resolve(window.Plaid); else { script.remove(); scriptPromise = null; reject(new Error("Plaid couldn't load. Please try again.")); } };
    script.onerror = () => { clearTimeout(timer); script.remove(); scriptPromise = null; reject(new Error("Plaid couldn't load. Check your connection and try again.")); };
    document.head.appendChild(script);
  });
  return scriptPromise;
}
async function api(path, options = {}) {
  const response = await fetch(`/api/banking${path}`, { credentials: "same-origin", cache: "no-store", ...options,
    headers: { "Content-Type": "application/json", ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "We couldn't complete that bank action.");
  return data;
}
export function isBankOAuthReturn() {
  return Platform.OS === "web" && new URLSearchParams(window.location.search).has("oauth_state_id");
}
function clearReturn() {
  if (!isBankOAuthReturn()) return;
  const url = new URL(window.location.href); url.searchParams.delete("oauth_state_id");
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}
function rememberSession(id) { try { window.sessionStorage.setItem("payplace-bank-session", id); } catch {} }
function currentSession() { try { return window.sessionStorage.getItem("payplace-bank-session"); } catch { return null; } }
function forgetSession() { try { window.sessionStorage.removeItem("payplace-bank-session"); } catch {} }
function amount(value, currency) {
  if (value == null) return "Not reported";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(value);
}

export default function BankConnections({ visible, onClose, onUseBalance }) {
  const [status, setStatus] = useState(BANK_LINKING_UPCOMING ? { configured: false, connections: [] } : null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const handler = useRef(null);
  const resumed = useRef(false);

  async function loadStatus() {
    setLoading(true);
    try { const result = await api("/status"); setStatus(result); setError(""); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  function finishLink() {
    handler.current?.destroy(); handler.current = null;
    setLinkOpen(false); setBusy(false); forgetSession(); clearReturn();
  }
  async function launchLink(session, redirect = false) {
    const plaid = await sdk();
    rememberSession(session.session_id);
    handler.current?.destroy();
    handler.current = plaid.create({
      token: session.link_token,
      ...(redirect ? { receivedRedirectUri: window.location.href } : {}),
      onSuccess: async (publicToken) => {
        try {
          await api("/exchange", { method: "POST", body: JSON.stringify({ public_token: publicToken, session_id: session.session_id }) });
          setNotice(session.update ? "Your bank connection is up to date." : "Your bank is connected. Choose a reported balance to use in your plan.");
          await loadStatus();
        } catch (e) { setError(e.message); }
        finally { finishLink(); }
      },
      onExit: (err) => {
        if (err) setError("The bank connection wasn't completed. Please try again.");
        finishLink();
      },
    });
    setLinkOpen(true);
    handler.current.open();
  }
  async function connect(connectionId) {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const session = await api("/link-token", { method: "POST", body: JSON.stringify(connectionId ? { connection_id: connectionId } : {}) });
      await launchLink(session);
    } catch (e) { setError(e.message); setBusy(false); setLinkOpen(false); }
  }
  function disconnect(connection) {
    Alert.alert("Disconnect this bank?", `Remove PayPlace's access to ${connection.institution}? Your manually entered plan stays available.`, [
      { text: "Keep connected", style: "cancel" },
      { text: "Disconnect", style: "destructive", onPress: async () => {
        setBusy(true); setError("");
        try { await api(`/connections/${connection.id}`, { method: "DELETE", body: "{}" }); setNotice("Your bank has been disconnected."); await loadStatus(); }
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
      } },
    ]);
  }
  useEffect(() => {
    if (!visible || Platform.OS !== "web" || BANK_LINKING_UPCOMING) return;
    loadStatus();
    if (isBankOAuthReturn() && !resumed.current) {
      resumed.current = true; setBusy(true);
      const id = currentSession();
      api(`/resume${id ? `?session_id=${encodeURIComponent(id)}` : ""}`)
        .then((session) => launchLink(session, true))
        .catch((e) => { setError(e.message); setBusy(false); });
    }
  }, [visible]);
  useEffect(() => () => handler.current?.destroy(), []);

  return (
    <Modal visible={visible && !linkOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.panel}>
          <View style={s.heading}>
            <View style={{ flex: 1 }}><Text style={s.title}>Bank linking</Text><Text style={s.subtitle}>{status?.configured ? "Choose what you share. Stay in control." : "Coming soon · Premium"}</Text></View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close bank connections" onPress={onClose} style={s.close}><Ionicons name="close" size={25} color="#071A3A" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.content}>
            <View style={s.explanation}><Ionicons name="shield-checkmark" size={24} color="#11B8A7" /><Text style={s.body}>{status?.configured ? "Sign in through Plaid or your bank. PayPlace doesn't collect your bank password. You can disconnect a bank here whenever you choose." : "Bank linking is planned as a paid Premium feature. You can keep entering your balance and bills manually today."}</Text></View>
            {Platform.OS !== "web" ? <Text style={s.body}>Open PayPlace's website to connect a bank.</Text> : null}
            {loading && <ActivityIndicator color="#6754E8" />}
            {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
            {notice ? <Text accessibilityRole="alert" style={s.notice}>{notice}</Text> : null}
            {status && !status.configured ? <View style={s.info}><Text style={s.infoTitle}>A little less manual entry</Text><Text style={s.body}>The planned Premium feature will let you review linked accounts and choose a reported balance for your plan.</Text></View> : null}
            {status?.configured && status.environment === "sandbox" ? <View style={s.info}><Text style={s.infoTitle}>Test banks only</Text><Text style={s.body}>This is a test connection with sample accounts. Real bank accounts aren't connected in this mode.</Text></View> : null}
            {status?.configured && !status.connections.length ? <Text style={s.body}>No banks connected yet.</Text> : null}
            {(status?.connections || []).map((bank) => <View key={bank.id} style={s.bank}>
              <View style={s.bankHeader}><Text style={s.bankTitle}>{bank.institution}</Text><TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => disconnect(bank)}><Text style={s.disconnect}>Disconnect</Text></TouchableOpacity></View>
              {bank.error ? <><Text style={s.error}>{bank.error.message}</Text>{bank.error.code === "RECONNECT_REQUIRED" && <TouchableOpacity disabled={busy} onPress={() => connect(bank.id)} style={s.secondary}><Text style={s.secondaryText}>Reconnect bank</Text></TouchableOpacity>}</> : null}
              {bank.accounts.map((account) => {
                const value = account.available ?? account.current;
                return <View key={account.id} style={s.account}>
                  <Text style={s.accountTitle}>{account.name}{account.mask ? ` •••• ${account.mask}` : ""}</Text>
                  <Text style={s.caption}>Reported {account.available != null ? "available " : ""}balance</Text>
                  <Text style={s.balance}>{amount(value, account.currency)}</Text>
                  {account.type === "depository" && account.currency === "USD" && Number.isFinite(value) ? <TouchableOpacity accessibilityRole="button" onPress={() => { onUseBalance(value); setNotice(`Your plan now uses the reported balance from ${account.name}.`); }} style={s.secondary}><Text style={s.secondaryText}>Use in my plan</Text></TouchableOpacity> : null}
                </View>;
              })}
              {bank.checkedAt ? <Text style={s.caption}>Checked {new Date(bank.checkedAt).toLocaleString()}. Reported balances may lag behind your bank.</Text> : null}
            </View>)}
            <TouchableOpacity accessibilityRole="button" disabled={!status?.configured || busy || Platform.OS !== "web"} style={[s.primary, (!status?.configured || busy) && { opacity: 0.5 }]} onPress={() => connect()}>
              {busy ? <ActivityIndicator color="white" /> : <Text style={s.primaryText}>{!status?.configured ? "Coming soon" : status?.connections?.length ? "Connect another bank" : "Connect a bank"}</Text>}
            </TouchableOpacity>
            {status?.configured && <TouchableOpacity accessibilityRole="button" disabled={busy || loading} onPress={loadStatus} style={s.secondary}><Text style={s.secondaryText}>Refresh reported accounts</Text></TouchableOpacity>}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(7,26,58,0.55)", justifyContent: "center", alignItems: "center", padding: 16 },
  panel: { width: "100%", maxWidth: 580, maxHeight: "90%", backgroundColor: "#F6FBFF", borderRadius: 24, overflow: "hidden" },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 20, backgroundColor: "white" },
  title: { fontSize: 22, fontWeight: "800", color: "#071A3A" }, subtitle: { fontSize: 14, color: "#536178", marginTop: 5 },
  close: { padding: 8 }, content: { padding: 20, gap: 16 }, explanation: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  body: { flexShrink: 1, fontSize: 16, lineHeight: 24, color: "#334660" }, info: { backgroundColor: "#EEE9FF", padding: 16, borderRadius: 16, gap: 7 },
  infoTitle: { fontSize: 17, fontWeight: "700", color: "#071A3A" }, error: { fontSize: 16, lineHeight: 24, color: "#A32828" }, notice: { fontSize: 16, lineHeight: 24, color: "#087567" },
  bank: { backgroundColor: "white", padding: 16, borderRadius: 16, gap: 14 }, bankHeader: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  bankTitle: { fontSize: 18, fontWeight: "800", color: "#071A3A" }, disconnect: { fontSize: 14, color: "#A32828", fontWeight: "700" },
  account: { borderTopWidth: 1, borderTopColor: "#DDEAF4", paddingTop: 12, gap: 7 }, accountTitle: { fontSize: 16, fontWeight: "700", color: "#071A3A" },
  caption: { fontSize: 14, lineHeight: 20, color: "#536178" }, balance: { fontSize: 25, fontWeight: "800", color: "#071A3A" },
  primary: { backgroundColor: "#6754E8", minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", padding: 14 }, primaryText: { fontSize: 16, fontWeight: "800", color: "white" },
  secondary: { minHeight: 44, backgroundColor: "#DFFCF7", borderRadius: 12, alignItems: "center", justifyContent: "center", padding: 12 }, secondaryText: { fontSize: 15, fontWeight: "700", color: "#075E54" },
});
