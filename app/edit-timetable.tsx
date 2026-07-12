import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../src/context/AppContext";
import { rawCombinedWeekSchedule, DAY_ORDER } from "../src/data/timetable";
import { EditClassModal } from "../src/components/EditClassModal";
import { colors, radius, spacing } from "../src/theme";
import { ScheduledClass } from "../src/types";

export default function EditTimetableScreen() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const rawWeek = useMemo(() => rawCombinedWeekSchedule(state.selection), [state.selection]);
  const [editing, setEditing] = useState<ScheduledClass | null>(null);

  const hasSelection = !!state.selection.core || !!state.selection.pe1 || !!state.selection.pe2;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Timetable</Text>
        <Text style={styles.headerSub}>Correct room numbers or timings, or remove a class permanently.</Text>
      </View>

      {!hasSelection ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Choose your sections first.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing(4), paddingBottom: spacing(10) }}>
          {DAY_ORDER.map((day) => (
            <View key={day} style={{ marginBottom: spacing(4) }}>
              <Text style={styles.dayHeader}>{day}</Text>
              {rawWeek[day].length === 0 ? (
                <Text style={styles.noClass}>No classes</Text>
              ) : (
                rawWeek[day].map((cls) => {
                  const ov = state.overrides[cls.id];
                  const room = ov?.room ?? cls.room;
                  const start = ov?.start ?? cls.start;
                  const end = ov?.end ?? cls.end;
                  const moved = !!ov?.day && ov.day !== cls.day;
                  return (
                    <TouchableOpacity
                      key={cls.id}
                      style={[styles.row, ov?.removed && styles.rowRemoved]}
                      onPress={() => setEditing(cls)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.subject, ov?.removed && styles.strike]}>{cls.subject}</Text>
                        <Text style={styles.meta}>
                          {ov?.removed ? "Removed" : moved ? `Moved to ${ov!.day}` : `${start}–${end} · ${room}`} · {cls.sectionCode}
                        </Text>
                      </View>
                      {!!ov && <Text style={styles.editedTag}>{ov.removed ? "REMOVED" : moved ? "MOVED" : "EDITED"}</Text>}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>

      <EditClassModal
        visible={!!editing}
        cls={editing}
        currentOverride={editing ? state.overrides[editing.id] : undefined}
        onClose={() => setEditing(null)}
        onSave={(override) => {
          if (editing) dispatch({ type: "SET_OVERRIDE", classId: editing.id, override });
        }}
        onRemove={() => {
          if (editing) dispatch({ type: "SET_OVERRIDE", classId: editing.id, override: { removed: true } });
        }}
        onReset={() => {
          if (editing) dispatch({ type: "CLEAR_OVERRIDE", classId: editing.id });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing(4), paddingTop: spacing(2), paddingBottom: spacing(3) },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  headerSub: { color: colors.textDim, fontSize: 12, marginTop: 3 },
  dayHeader: { color: colors.text, fontSize: 13, fontWeight: "700", marginBottom: spacing(2) },
  noClass: { color: colors.textFaint, fontSize: 12, fontStyle: "italic" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing(3),
    marginBottom: spacing(2),
  },
  rowRemoved: { opacity: 0.5, borderColor: colors.bad + "50" },
  subject: { color: colors.text, fontSize: 14, fontWeight: "700" },
  strike: { textDecorationLine: "line-through" },
  meta: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  editedTag: { color: colors.accent, fontSize: 9, fontWeight: "700" },
  doneBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 13, alignItems: "center", margin: spacing(4) },
  doneBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.textDim, fontSize: 14 },
});
