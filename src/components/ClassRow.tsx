import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme";
import { ScheduledClass, AttendanceStatus } from "../types";

export function ClassRow({
  cls,
  status,
  onMark,
  markable = true,
}: {
  cls: ScheduledClass;
  status?: AttendanceStatus;
  onMark: (status: AttendanceStatus) => void;
  markable?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.timeCol}>
        <Text style={styles.time}>{cls.start}</Text>
        <Text style={styles.timeEnd}>{cls.end}</Text>
      </View>
      <View
        style={[
          styles.body,
          status === "present" && styles.bodyPresent,
          status === "absent" && styles.bodyAbsent,
          status === "cancelled" && styles.bodyCancelled,
        ]}
      >
        <Text style={styles.subject}>{cls.subject}</Text>
        <Text style={styles.meta}>
          {cls.room} · {cls.sectionCode}
        </Text>
        {markable && (
          <View style={styles.actions}>
            <MarkBtn label="Present" active={status === "present"} color={colors.good} onPress={() => onMark("present")} />
            <MarkBtn label="Absent" active={status === "absent"} color={colors.bad} onPress={() => onMark("absent")} />
            <MarkBtn label="Cancelled" active={status === "cancelled"} color={colors.textDim} onPress={() => onMark("cancelled")} />
          </View>
        )}
      </View>
    </View>
  );
}

function MarkBtn({ label, active, color, onPress }: { label: string; active: boolean; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.markBtn, active && { borderColor: color, backgroundColor: color + "26" }]}
      onPress={onPress}
    >
      <Text style={[styles.markBtnText, active && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing(3), marginBottom: spacing(2.5) },
  timeCol: { width: 56, alignItems: "flex-end", paddingTop: spacing(3.5) },
  time: { color: colors.text, fontSize: 13, fontWeight: "600" },
  timeEnd: { color: colors.textFaint, fontSize: 11 },
  body: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing(3),
  },
  bodyPresent: { borderColor: colors.good + "80" },
  bodyAbsent: { borderColor: colors.bad + "80", opacity: 0.85 },
  bodyCancelled: { opacity: 0.5 },
  subject: { color: colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  actions: { flexDirection: "row", gap: 6, marginTop: 10 },
  markBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: "center",
  },
  markBtnText: { fontSize: 11, fontWeight: "600", color: colors.textDim },
});
