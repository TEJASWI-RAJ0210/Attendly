import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Header } from "../../src/components/Header";
import { useApp } from "../../src/context/AppContext";
import { combinedWeekSchedule, DAY_ORDER } from "../../src/data/timetable";
import { colors, radius, spacing } from "../../src/theme";

const COLUMN_WIDTH = 168;

export default function WeeklyScreen() {
  const { state, loaded } = useApp();
  const router = useRouter();
  const hasSelection = !!state.selection.core || !!state.selection.pe1 || !!state.selection.pe2;
  const week = useMemo(() => combinedWeekSchedule(state.selection), [state.selection]);

  if (!loaded) return null;

  const sectionLine = [state.selection.core, state.selection.pe1, state.selection.pe2].filter(Boolean).join(" · ");

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Weekly" subtitle={sectionLine || undefined} />

      {!hasSelection ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🗓️</Text>
          <Text style={styles.emptyText}>Pick your sections to see the weekly grid</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/sections")}>
            <Text style={styles.emptyBtnText}>Choose Sections</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: spacing(4) }}>
          {DAY_ORDER.map((day) => (
            <View key={day} style={styles.column}>
              <Text style={styles.dayHeader}>{day}</Text>
              {week[day].length === 0 ? (
                <Text style={styles.noClass}>No classes</Text>
              ) : (
                week[day].map((c) => (
                  <View key={c.id} style={styles.classCard}>
                    <Text style={styles.time}>
                      {c.start}–{c.end}
                    </Text>
                    <Text style={styles.subject}>{c.subject}</Text>
                    <Text style={styles.meta}>
                      {c.room} · {c.sectionCode}
                    </Text>
                  </View>
                ))
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  column: { width: COLUMN_WIDTH, marginRight: spacing(3) },
  dayHeader: { color: colors.text, fontSize: 14, fontWeight: "700", marginBottom: spacing(2) },
  noClass: { color: colors.textFaint, fontSize: 12, fontStyle: "italic" },
  classCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing(2.5),
    marginBottom: spacing(2),
  },
  time: { color: colors.accent, fontSize: 11, fontWeight: "700", marginBottom: 2 },
  subject: { color: colors.text, fontSize: 13, fontWeight: "700" },
  meta: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing(8) },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: colors.textDim, fontSize: 14, textAlign: "center", marginBottom: 16 },
  emptyBtn: { backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: radius.md },
  emptyBtnText: { color: colors.white, fontWeight: "700" },
});
