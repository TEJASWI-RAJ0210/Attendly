import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.brand}>Attendly</Text>
        <Text style={styles.credit}>Developed By Tejaswi</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/sections")}>
          <Ionicons name="layers-outline" size={20} color={colors.textDim} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={20} color={colors.textDim} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing(4),
    paddingTop: spacing(4),
    paddingBottom: spacing(2),
  },
  title: { color: colors.text, fontSize: 22, fontWeight: "700", marginTop: 6 },
  subtitle: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  brand: { color: colors.accent, fontSize: 20, fontWeight: "800", letterSpacing: 0.3 },
  credit: { color: colors.textFaint, fontSize: 11, marginTop: 1 },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
