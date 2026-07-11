import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Header } from "../../src/components/Header";
import { ClassRow } from "../../src/components/ClassRow";
import { CalendarPicker } from "../../src/components/CalendarPicker";
import { useApp } from "../../src/context/AppContext";
import { combinedDaySchedule } from "../../src/data/timetable";
import { colors, radius, spacing } from "../../src/theme";
import {
  toISODate,
  addDays,
  dayNameOf,
  isCollegeDay,
  formatHuman,
  examPeriodOf,
  SEMESTER_START,
  SEMESTER_END,
} from "../../src/utils/date";
import { recordKey } from "../../src/utils/attendance";

export default function TodayScreen() {
  const { state, dispatch, loaded } = useApp();
  const router = useRouter();
  const [selectedISO, setSelectedISO] = useState(toISODate(new Date()));
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedDate = new Date(selectedISO);
  const dayName = dayNameOf(selectedDate);
  const isPast = selectedISO < toISODate(new Date());
  const isFuture = selectedISO > toISODate(new Date());
  const collegeDay = isCollegeDay(selectedDate);
  const exam = examPeriodOf(selectedDate);

  const hasSelection = !!state.selection.core || !!state.selection.pe1 || !!state.selection.pe2;

  const classes = useMemo(() => {
    if (!dayName) return [];
    return combinedDaySchedule(state.selection, dayName);
  }, [state.selection, dayName]);

  const stripDates = useMemo(() => {
    const arr = [];
    for (let i = -3; i <= 3; i++) arr.push(addDays(selectedDate, i));
    return arr;
  }, [selectedISO]);

  if (!loaded) return null;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header
        title={selectedISO === toISODate(new Date()) ? "Today" : selectedDate.toLocaleDateString(undefined, { weekday: "long" })}
        subtitle={formatHuman(selectedDate)}
      />

      {!hasSelection ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>Pick your sections to see your schedule</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/sections")}>
            <Text style={styles.emptyBtnText}>Choose Sections</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.stripRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: spacing(4) }}>
              {stripDates.map((d) => {
                const iso = toISODate(d);
                const active = iso === selectedISO;
                const today = iso === toISODate(new Date());
                return (
                  <TouchableOpacity key={iso} style={[styles.chip, active && styles.chipActive]} onPress={() => setSelectedISO(iso)}>
                    <Text style={[styles.chipDate, active && styles.chipTextActive]}>{d.getDate()}</Text>
                    <Text style={[styles.chipLabel, active && styles.chipTextActive]}>
                      {today ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" })}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.calBtn} onPress={() => setCalendarOpen(true)}>
              <Text style={styles.calBtnText}>📅</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing(4), paddingBottom: spacing(20) }}>
            {!collegeDay ? (
              <View style={styles.card}>
                <Text style={styles.cardEmoji}>{exam ? "📝" : selectedISO < SEMESTER_START || selectedISO > SEMESTER_END ? "🗓️" : "🎉"}</Text>
                <Text style={styles.cardText}>
                  {exam
                    ? exam.label
                    : selectedISO < SEMESTER_START || selectedISO > SEMESTER_END
                    ? "Outside your semester dates"
                    : "Weekend — no classes"}
                </Text>
              </View>
            ) : classes.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.cardEmoji}>🎉</Text>
                <Text style={styles.cardText}>No classes scheduled</Text>
              </View>
            ) : (
              classes.map((cls) => {
                const key = recordKey(cls.subject, selectedISO, cls.start);
                const status = state.records[key];
                return (
                  <ClassRow
                    key={cls.id}
                    cls={cls}
                    status={status}
                    markable={!isFuture}
                    onMark={(s) =>
                      dispatch({ type: "MARK", subject: cls.subject, dateISO: selectedISO, start: cls.start, status: s })
                    }
                  />
                );
              })
            )}
            {isFuture && classes.length > 0 && <Text style={styles.futureNote}>Attendance marking opens once this day arrives.</Text>}
          </ScrollView>
        </>
      )}

      <CalendarPicker
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onSelect={setSelectedISO}
        selectedISO={selectedISO}
        minISO={SEMESTER_START}
        maxISO={SEMESTER_END}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stripRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing(2) },
  chip: {
    minWidth: 52,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipDate: { color: colors.text, fontSize: 15, fontWeight: "700" },
  chipLabel: { color: colors.textDim, fontSize: 10, textTransform: "uppercase", marginTop: 2 },
  chipTextActive: { color: colors.white },
  calBtn: { paddingHorizontal: spacing(3) },
  calBtnText: { fontSize: 20 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(8),
    alignItems: "center",
  },
  cardEmoji: { fontSize: 32, marginBottom: 8 },
  cardText: { color: colors.textDim, fontSize: 14 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing(8) },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: colors.textDim, fontSize: 14, textAlign: "center", marginBottom: 16 },
  emptyBtn: { backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: radius.md },
  emptyBtnText: { color: colors.white, fontWeight: "700" },
  futureNote: { color: colors.textFaint, fontSize: 12, textAlign: "center", marginTop: 8 },
});
