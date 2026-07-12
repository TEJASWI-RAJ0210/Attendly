import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../theme";
import { ScheduledClass, ClassOverride, DayName } from "../types";
import { DAY_ORDER } from "../data/timetable";

export function EditClassModal({
  visible,
  onClose,
  cls,
  currentOverride,
  onSave,
  onRemove,
  onReset,
}: {
  visible: boolean;
  onClose: () => void;
  cls: ScheduledClass | null;
  currentOverride?: ClassOverride;
  onSave: (override: ClassOverride) => void;
  onRemove: () => void;
  onReset: () => void;
}) {
  const [room, setRoom] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [day, setDay] = useState<DayName>("Monday");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (cls) {
      setRoom(currentOverride?.room ?? cls.room);
      setStart(currentOverride?.start ?? cls.start);
      setEnd(currentOverride?.end ?? cls.end);
      setDay(currentOverride?.day ?? cls.day);
    }
  }, [cls, currentOverride, visible]);

  if (!cls) return null;

  const isTimeValid = (t: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t.trim());
  const valid = isTimeValid(start) && isTimeValid(end) && room.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: spacing(5) + insets.bottom }]} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{cls.subject}</Text>
          <Text style={styles.sub}>
            {cls.day} · {cls.sectionCode}
          </Text>

          <Text style={styles.label}>Room</Text>
          <TextInput style={styles.input} value={room} onChangeText={setRoom} placeholder="e.g. C25-A206" placeholderTextColor={colors.textFaint} />

          <Text style={styles.label}>Day</Text>
          <View style={styles.dayRow}>
            {DAY_ORDER.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.dayPill, day === d && styles.dayPillActive]}
                onPress={() => setDay(d)}
              >
                <Text style={[styles.dayPillText, day === d && styles.dayPillTextActive]}>{d.slice(0, 3)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {day !== cls.day && (
            <Text style={styles.moveNote}>
              This will move the class from {cls.day} to {day}.
            </Text>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start (24h)</Text>
              <TextInput style={styles.input} value={start} onChangeText={setStart} placeholder="09:00" placeholderTextColor={colors.textFaint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End (24h)</Text>
              <TextInput style={styles.input} value={end} onChangeText={setEnd} placeholder="10:00" placeholderTextColor={colors.textFaint} />
            </View>
          </View>

          {!valid && <Text style={styles.error}>Enter room and times as HH:MM (e.g. 09:00)</Text>}

          <TouchableOpacity
            style={[styles.saveBtn, !valid && { opacity: 0.4 }]}
            disabled={!valid}
            onPress={() => {
              onSave({ room: room.trim(), start: start.trim(), end: end.trim(), day });
              onClose();
            }}
          >
            <Text style={styles.saveBtnText}>Save changes</Text>
          </TouchableOpacity>

          {!!currentOverride && (
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                onReset();
                onClose();
              }}
            >
              <Text style={styles.resetBtnText}>Reset to original timetable</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => {
              onRemove();
              onClose();
            }}
          >
            <Text style={styles.removeBtnText}>{currentOverride?.removed ? "Already removed" : "Remove this class"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing(5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: 17, fontWeight: "700" },
  sub: { color: colors.textDim, fontSize: 12, marginTop: 2, marginBottom: spacing(4) },
  label: { color: colors.textDim, fontSize: 12, fontWeight: "500", marginBottom: 5, marginTop: spacing(3) },
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
  row: { flexDirection: "row", gap: 10 },
  dayRow: { flexDirection: "row", gap: 6 },
  dayPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: "center",
  },
  dayPillActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  dayPillText: { color: colors.textDim, fontSize: 12, fontWeight: "600" },
  dayPillTextActive: { color: colors.accent },
  moveNote: { color: colors.warn, fontSize: 11, marginTop: spacing(2) },
  error: { color: colors.bad, fontSize: 11, marginTop: spacing(2) },
  saveBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 13, alignItems: "center", marginTop: spacing(5) },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  resetBtn: { paddingVertical: 12, alignItems: "center", marginTop: spacing(2) },
  resetBtnText: { color: colors.textDim, fontSize: 13, fontWeight: "600" },
  removeBtn: {
    borderWidth: 1,
    borderColor: colors.bad + "60",
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: spacing(2),
  },
  removeBtnText: { color: colors.bad, fontSize: 13, fontWeight: "600" },
  cancelBtn: { paddingVertical: 12, alignItems: "center", marginTop: spacing(1) },
  cancelBtnText: { color: colors.textFaint, fontSize: 13 },
});
