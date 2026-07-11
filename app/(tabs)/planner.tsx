import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../src/components/Header";
import { useApp } from "../../src/context/AppContext";
import { colors, radius, spacing } from "../../src/theme";
import { daysUntil, parseISODate, formatShort } from "../../src/utils/date";
import { PlannerItem } from "../../src/types";

export default function PlannerScreen() {
  const { state, dispatch, loaded } = useApp();
  const router = useRouter();

  const sorted = useMemo(() => {
    return [...state.planner].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [state.planner]);

  const pending = sorted.filter((p) => !p.done);
  const done = sorted.filter((p) => p.done);

  if (!loaded) return null;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Planner" subtitle="Assignments & tests" />

      <ScrollView contentContainerStyle={{ padding: spacing(4), paddingBottom: spacing(20) }}>
        {pending.length === 0 && done.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>🗒️</Text>
            <Text style={styles.cardText}>No assignments or tests yet. Tap + to add one.</Text>
          </View>
        ) : (
          <>
            {pending.map((item) => (
              <PlannerRow key={item.id} item={item} onToggle={() => dispatch({ type: "TOGGLE_PLANNER_DONE", id: item.id })} onDelete={() => dispatch({ type: "DELETE_PLANNER", id: item.id })} />
            ))}
            {done.length > 0 && (
              <>
                <Text style={styles.doneHeader}>Completed</Text>
                {done.map((item) => (
                  <PlannerRow key={item.id} item={item} onToggle={() => dispatch({ type: "TOGGLE_PLANNER_DONE", id: item.id })} onDelete={() => dispatch({ type: "DELETE_PLANNER", id: item.id })} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/add-planner-item")}>
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function PlannerRow({ item, onToggle, onDelete }: { item: PlannerItem; onToggle: () => void; onDelete: () => void }) {
  const dleft = daysUntil(item.dueDate);
  let badgeColor = colors.textDim;
  let badgeText = `In ${dleft} day${dleft === 1 ? "" : "s"}`;
  if (item.done) {
    badgeColor = colors.textFaint;
    badgeText = "Done";
  } else if (dleft < 0) {
    badgeColor = colors.bad;
    badgeText = `Overdue ${Math.abs(dleft)}d`;
  } else if (dleft === 0) {
    badgeColor = colors.bad;
    badgeText = "Due today";
  } else if (dleft <= 3) {
    badgeColor = colors.warn;
    badgeText = `Due in ${dleft}d`;
  }

  return (
    <View style={[styles.row, item.done && { opacity: 0.5 }]}>
      <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
        {item.done && <Ionicons name="checkmark" size={16} color={colors.white} />}
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.subject} · {item.type === "test" ? "Test" : "Assignment"} · {formatShort(parseISODate(item.dueDate))}
        </Text>
      </View>
      <View style={styles.rightCol}>
        <Text style={[styles.badge, { color: badgeColor }]}>{badgeText}</Text>
        <TouchableOpacity onPress={onDelete} style={{ marginTop: 6 }}>
          <Ionicons name="trash-outline" size={16} color={colors.textFaint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing(3),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing(3),
    marginBottom: spacing(2.5),
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  title: { color: colors.text, fontSize: 14, fontWeight: "700" },
  meta: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  rightCol: { alignItems: "flex-end" },
  badge: { fontSize: 11, fontWeight: "700" },
  doneHeader: { color: colors.textFaint, fontSize: 12, fontWeight: "700", marginTop: spacing(2), marginBottom: spacing(2) },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(8),
    alignItems: "center",
  },
  cardEmoji: { fontSize: 32, marginBottom: 8 },
  cardText: { color: colors.textDim, fontSize: 14, textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: spacing(6),
    right: spacing(5),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
});
