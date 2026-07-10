import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme";
import { toISODate, examPeriodOf } from "../utils/date";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function CalendarPicker({
  visible,
  onClose,
  onSelect,
  selectedISO,
  minISO,
  maxISO,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (iso: string) => void;
  selectedISO?: string;
  minISO?: string;
  maxISO?: string;
}) {
  const initial = selectedISO ? new Date(selectedISO) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  function shiftMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.navBtn}>
              <Text style={styles.navText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {firstOfMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </Text>
            <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.navBtn}>
              <Text style={styles.navText}>›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.weekRow}>
            {WEEKDAYS.map((w, i) => (
              <Text key={i} style={styles.weekday}>
                {w}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((d, i) => {
              if (!d) return <View key={i} style={styles.cell} />;
              const iso = toISODate(d);
              const disabled = (minISO && iso < minISO) || (maxISO && iso > maxISO) || !!examPeriodOf(d);
              const isSelected = iso === selectedISO;
              const isToday = iso === toISODate(new Date());
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.cell, isSelected && styles.cellSelected, disabled && styles.cellDisabled]}
                  disabled={!!disabled}
                  onPress={() => {
                    onSelect(iso);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.cellText,
                      isToday && !isSelected && styles.cellTextToday,
                      isSelected && styles.cellTextSelected,
                      disabled && styles.cellTextDisabled,
                    ]}
                  >
                    {d.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(4),
    width: 320,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing(3) },
  monthLabel: { color: colors.text, fontSize: 15, fontWeight: "700" },
  navBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  navText: { color: colors.accent, fontSize: 20, fontWeight: "700" },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekday: { width: CELL_SIZE, textAlign: "center", color: colors.textFaint, fontSize: 11, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: CELL_SIZE, height: CELL_SIZE, alignItems: "center", justifyContent: "center", borderRadius: radius.sm },
  cellSelected: { backgroundColor: colors.accent },
  cellDisabled: { opacity: 0.25 },
  cellText: { color: colors.text, fontSize: 13 },
  cellTextToday: { color: colors.accent, fontWeight: "700" },
  cellTextSelected: { color: colors.white, fontWeight: "700" },
  cellTextDisabled: { color: colors.textFaint },
});
