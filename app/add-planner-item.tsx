import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp, uid } from "../src/context/AppContext";
import { allSelectedSubjects } from "../src/data/timetable";
import { FieldPicker } from "../src/components/FieldPicker";
import { CalendarPicker } from "../src/components/CalendarPicker";
import { colors, radius, spacing } from "../src/theme";
import { toISODate, formatShort, parseISODate } from "../src/utils/date";

export default function AddPlannerItem() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const subjects = allSelectedSubjects(state.selection);

  const [subject, setSubject] = useState<string | undefined>(subjects[0]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"assignment" | "test">("assignment");
  const [dueDate, setDueDate] = useState(toISODate(new Date()));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [error, setError] = useState("");

  function save() {
    if (!subject) {
      setError("Please select a subject");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    dispatch({
      type: "ADD_PLANNER",
      item: { id: uid(), subject, title: title.trim(), type, dueDate, done: false },
    });
    router.back();
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.wrap}>
      <ScrollView contentContainerStyle={{ padding: spacing(5) }}>
        <Text style={styles.header}>New assignment / test</Text>

        <FieldPicker label="Subject" value={subject} placeholder="Select subject" options={subjects} onSelect={setSubject} />

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Lab report 3"
          placeholderTextColor={colors.textFaint}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity style={[styles.typeBtn, type === "assignment" && styles.typeBtnActive]} onPress={() => setType("assignment")}>
            <Text style={[styles.typeText, type === "assignment" && styles.typeTextActive]}>Assignment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, type === "test" && styles.typeBtnActive]} onPress={() => setType("test")}>
            <Text style={[styles.typeText, type === "test" && styles.typeTextActive]}>Test</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Due date</Text>
        <TouchableOpacity style={styles.dateField} onPress={() => setCalendarOpen(true)}>
          <Text style={styles.dateText}>{formatShort(parseISODate(dueDate))}</Text>
        </TouchableOpacity>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>

      <CalendarPicker visible={calendarOpen} onClose={() => setCalendarOpen(false)} onSelect={setDueDate} selectedISO={dueDate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: spacing(4) },
  label: { color: colors.textDim, fontSize: 12, fontWeight: "500", marginTop: spacing(4), marginBottom: 5 },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 14,
  },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: "center",
  },
  typeBtnActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  typeText: { color: colors.textDim, fontSize: 13, fontWeight: "600" },
  typeTextActive: { color: colors.accent },
  dateField: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dateText: { color: colors.text, fontSize: 14 },
  error: { color: colors.bad, fontSize: 12, marginTop: spacing(3) },
  saveBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 13, alignItems: "center", marginTop: spacing(6) },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  cancelBtn: { paddingVertical: 13, alignItems: "center", marginTop: spacing(2) },
  cancelBtnText: { color: colors.textDim, fontSize: 14 },
});
