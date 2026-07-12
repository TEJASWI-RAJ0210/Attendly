import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useApp } from "../src/context/AppContext";
import { colors, radius, spacing } from "../src/theme";

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [threshold, setThreshold] = useState(String(state.threshold));
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  function saveThreshold() {
    const v = Number(threshold);
    if (v > 0 && v <= 100) {
      dispatch({ type: "SET_THRESHOLD", value: v });
      showToast("Saved");
    } else {
      showToast("Enter a value between 1 and 100");
    }
  }

  async function exportData() {
    const json = JSON.stringify(state, null, 2);
    await Clipboard.setStringAsync(json);
    showToast("Backup copied to clipboard");
  }

  function wipeAll() {
    const doWipe = () => {
      dispatch({ type: "WIPE" });
      router.back();
    };
    if (Platform.OS === "web") {
      if (confirm("This deletes ALL sections, attendance and planner data permanently. Continue?")) doWipe();
    } else {
      Alert.alert("Erase all data", "This deletes ALL sections, attendance and planner data permanently.", [
        { text: "Cancel", style: "cancel" },
        { text: "Erase", style: "destructive", onPress: doWipe },
      ]);
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.wrap}>
      <ScrollView contentContainerStyle={{ padding: spacing(5) }}>
      <Text style={styles.header}>Settings</Text>

      <Text style={styles.label}>Global minimum attendance %</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={threshold}
          onChangeText={setThreshold}
          placeholderTextColor={colors.textFaint}
        />
        <TouchableOpacity style={styles.saveSmallBtn} onPress={saveThreshold}>
          <Text style={styles.saveSmallBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/edit-timetable")}>
        <Text style={styles.actionBtnText}>Edit Timetable (room / timing / remove)</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.actionBtn} onPress={exportData}>
        <Text style={styles.actionBtnText}>Export data (copy backup to clipboard)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={wipeAll}>
        <Text style={[styles.actionBtnText, styles.dangerText]}>Erase all data</Text>
      </TouchableOpacity>

      {!!toast && <Text style={styles.toast}>{toast}</Text>}

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelBtnText}>Close</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: { color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: spacing(5) },
  label: { color: colors.textDim, fontSize: 12, fontWeight: "500", marginBottom: 6 },
  row: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 14,
  },
  saveSmallBtn: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  saveSmallBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing(5) },
  actionBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: spacing(2.5),
  },
  actionBtnText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  dangerBtn: { borderColor: colors.bad + "60" },
  dangerText: { color: colors.bad },
  toast: { color: colors.good, fontSize: 12, textAlign: "center", marginTop: spacing(2) },
  cancelBtn: { paddingVertical: 13, alignItems: "center", marginTop: spacing(4) },
  cancelBtnText: { color: colors.textDim, fontSize: 14 },
});
