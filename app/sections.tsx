import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApp } from "../src/context/AppContext";
import { GROUPS, sectionsInGroup, groupOfSection } from "../src/data/timetable";
import { FieldPicker } from "../src/components/FieldPicker";
import { colors, radius, spacing } from "../src/theme";

export default function SectionsScreen() {
  const { state, dispatch } = useApp();
  const router = useRouter();

  const [coreGroup, setCoreGroup] = useState<string | undefined>(
    state.selection.core ? groupOfSection(state.selection.core) : undefined
  );
  const [pe1Group, setPe1Group] = useState<string | undefined>(
    state.selection.pe1 ? groupOfSection(state.selection.pe1) : undefined
  );
  const [pe2Group, setPe2Group] = useState<string | undefined>(
    state.selection.pe2 ? groupOfSection(state.selection.pe2) : undefined
  );

  const [core, setCore] = useState(state.selection.core);
  const [pe1, setPe1] = useState(state.selection.pe1);
  const [pe2, setPe2] = useState(state.selection.pe2);

  function save() {
    dispatch({ type: "SET_SELECTION", selection: { core, pe1, pe2 } });
    router.back();
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.wrap}>
      <ScrollView contentContainerStyle={{ padding: spacing(5) }}>
      <Text style={styles.header}>Your Sections</Text>
      <Text style={styles.sub}>Pick your core branch section, plus your two elective sections.</Text>

      <SectionBlock
        title="Core"
        groups={GROUPS.categories.core}
        group={coreGroup}
        onGroup={(g) => {
          setCoreGroup(g);
          setCore(undefined);
        }}
        section={core}
        onSection={setCore}
      />

      <SectionBlock
        title="Elective 1 (PE1)"
        groups={GROUPS.categories.pe1}
        group={pe1Group}
        onGroup={(g) => {
          setPe1Group(g);
          setPe1(undefined);
        }}
        section={pe1}
        onSection={setPe1}
      />

      <SectionBlock
        title="Elective 2 (PE2)"
        groups={GROUPS.categories.pe2}
        group={pe2Group}
        onGroup={(g) => {
          setPe2Group(g);
          setPe2(undefined);
        }}
        section={pe2}
        onSection={setPe2}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>Save Sections</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

function SectionBlock({
  title,
  groups,
  group,
  onGroup,
  section,
  onSection,
}: {
  title: string;
  groups: string[];
  group?: string;
  onGroup: (g: string) => void;
  section?: string;
  onSection: (s: string) => void;
}) {
  const sections = group ? sectionsInGroup(group) : [];
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <View style={styles.row}>
        <FieldPicker label="Group" value={group} placeholder="Select group" options={groups} onSelect={onGroup} />
        <FieldPicker label="Section" value={section} placeholder="Select section" options={sections} onSelect={onSection} disabled={!group} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: { color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: 4 },
  sub: { color: colors.textDim, fontSize: 12, marginBottom: spacing(5) },
  block: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing(3.5),
    marginBottom: spacing(3.5),
  },
  blockTitle: { color: colors.text, fontSize: 13, fontWeight: "700", marginBottom: spacing(2.5) },
  row: { flexDirection: "row", gap: spacing(2.5) },
  saveBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 13, alignItems: "center", marginTop: spacing(3) },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  cancelBtn: { paddingVertical: 13, alignItems: "center", marginTop: spacing(1) },
  cancelBtnText: { color: colors.textDim, fontSize: 14 },
});
