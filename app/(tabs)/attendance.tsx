import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Header } from "../../src/components/Header";
import { Ring } from "../../src/components/Ring";
import { useApp } from "../../src/context/AppContext";
import { allSelectedSubjects } from "../../src/data/timetable";
import { subjectStats, overallStats } from "../../src/utils/attendance";
import { colors, radius, spacing } from "../../src/theme";

export default function AttendanceScreen() {
  const { state, loaded } = useApp();
  const router = useRouter();
  const hasSelection = !!state.selection.core || !!state.selection.pe1 || !!state.selection.pe2;
  const subjects = useMemo(() => allSelectedSubjects(state.selection, state.overrides), [state.selection, state.overrides]);
  const overall = useMemo(() => overallStats(subjects, state.records), [subjects, state.records]);

  if (!loaded) return null;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Attendance" />

      {!hasSelection ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyText}>Pick your sections to start tracking attendance</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/sections")}>
            <Text style={styles.emptyBtnText}>Choose Sections</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing(4), paddingBottom: spacing(16) }}>
          <View style={styles.overallCard}>
            <Text style={styles.overallLabel}>Overall</Text>
            <Text style={styles.overallPct}>{overall.pct.toFixed(1)}%</Text>
            <Text style={styles.overallSub}>
              {overall.present}/{overall.total} classes attended · min required {state.threshold}%
            </Text>
          </View>

          {subjects.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardText}>No subjects found in your selected sections yet.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {subjects.map((subj) => {
                const min = state.subjectThresholds[subj] ?? state.threshold;
                const st = subjectStats(subj, state.records, min);
                return (
                  <View key={subj} style={styles.subjCard}>
                    <Ring pct={st.pct} threshold={min} size={72} />
                    <Text style={styles.subjName}>{subj}</Text>
                    <Text style={styles.subjCount}>
                      {st.present}/{st.total}
                    </Text>
                    {st.total === 0 ? (
                      <Text style={styles.subjHint}>no data yet</Text>
                    ) : st.pct >= min ? (
                      <Text style={[styles.subjHint, { color: colors.good }]}>can skip {st.safeToSkip}</Text>
                    ) : (
                      <Text style={[styles.subjHint, { color: colors.bad }]}>attend next {st.needToAttend}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overallCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(5),
    alignItems: "center",
    marginBottom: spacing(4),
  },
  overallLabel: { color: colors.textDim, fontSize: 12 },
  overallPct: { color: colors.text, fontSize: 32, fontWeight: "700", marginTop: 4 },
  overallSub: { color: colors.textFaint, fontSize: 11, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2.5) },
  subjCard: {
    width: "47%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(3.5),
    alignItems: "center",
  },
  subjName: { color: colors.text, fontSize: 13, fontWeight: "700", marginTop: 8 },
  subjCount: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  subjHint: { fontSize: 11, fontWeight: "700", marginTop: 6 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(6),
    alignItems: "center",
  },
  cardText: { color: colors.textDim, fontSize: 13, textAlign: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing(8) },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: colors.textDim, fontSize: 14, textAlign: "center", marginBottom: 16 },
  emptyBtn: { backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: radius.md },
  emptyBtnText: { color: colors.white, fontWeight: "700" },
});
