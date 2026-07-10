import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Pressable } from "react-native";
import { colors, radius, spacing } from "../theme";

export function FieldPicker({
  label,
  value,
  placeholder,
  options,
  onSelect,
  disabled,
}: {
  label: string;
  value?: string;
  placeholder: string;
  options: string[];
  onSelect: (val: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.field, disabled && { opacity: 0.4 }]}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.fieldText : styles.fieldPlaceholder} numberOfLines={1}>
          {value ?? placeholder}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item === value && styles.optionActive]}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, item === value && styles.optionTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.optionText}>No options</Text>}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textDim, fontSize: 12, marginBottom: 5, fontWeight: "500" },
  field: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldText: { color: colors.text, fontSize: 14, flexShrink: 1 },
  fieldPlaceholder: { color: colors.textFaint, fontSize: 14 },
  chevron: { color: colors.textDim, marginLeft: 6 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing(5),
    maxHeight: "70%",
  },
  sheetTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: 10 },
  option: { paddingVertical: 12, paddingHorizontal: 10, borderRadius: radius.sm },
  optionActive: { backgroundColor: colors.accentSoft },
  optionText: { color: colors.textDim, fontSize: 14 },
  optionTextActive: { color: colors.accent, fontWeight: "600" },
});
