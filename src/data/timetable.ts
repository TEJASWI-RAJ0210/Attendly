import sectionsRaw from "../../assets/data/sections.json";
import groupsRaw from "../../assets/data/groups.json";
import { SectionsData, GroupsManifest, DayName, ScheduledClass, SectionSelection, ClassOverrides } from "../types";

export const SECTIONS: SectionsData = sectionsRaw as SectionsData;
export const GROUPS: GroupsManifest = groupsRaw as GroupsManifest;

export const DAY_ORDER: DayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function sectionsInGroup(group: string): string[] {
  return GROUPS.groups[group]?.sections ?? [];
}

/** Build the composite lookup key used as a SECTIONS key and as a stored selection value */
export function sectionKey(group: string, code: string): string {
  return `${group}|${code}`;
}

export function groupOfSection(key: string): string | undefined {
  return SECTIONS[key]?.group;
}

export function codeOfSection(key: string): string | undefined {
  return SECTIONS[key]?.code;
}

/** All original (un-overridden) classes for one section on one day, sorted by start time.
 *  `key` is the composite "group|code" key, not the bare display code — section codes are
 *  not globally unique (the same code can appear in different semesters/groups). */
function classesForSectionDay(key: string, day: DayName): ScheduledClass[] {
  const sec = SECTIONS[key];
  if (!sec) return [];
  const slots = sec.days[day] ?? [];
  return slots
    .map((s) => ({
      id: `${key}|${day}|${s.start}`,
      sectionCode: sec.code,
      subject: s.subject,
      room: s.room,
      start: s.start,
      end: s.end,
      day,
    }))
    .sort((a, b) => a.start.localeCompare(b.start));
}

function applyOverride(cls: ScheduledClass, overrides: ClassOverrides): ScheduledClass | null {
  const ov = overrides[cls.id];
  if (!ov) return cls;
  if (ov.removed) return null;
  return {
    ...cls,
    room: ov.room ?? cls.room,
    start: ov.start ?? cls.start,
    end: ov.end ?? cls.end,
    day: ov.day ?? cls.day,
  };
}

/** Every original (un-overridden) class across all days for the selected sections */
function allRawClasses(selection: SectionSelection): ScheduledClass[] {
  const codes = [selection.core, selection.pe1, selection.pe2].filter(Boolean) as string[];
  return codes.flatMap((c) => DAY_ORDER.flatMap((day) => classesForSectionDay(c, day)));
}

/** Combine into a full week, keyed by the class's *effective* day (after any day-move override),
 *  with room/timing overrides applied and removed classes filtered out. */
export function combinedWeekSchedule(selection: SectionSelection, overrides: ClassOverrides = {}): Record<DayName, ScheduledClass[]> {
  const result = {} as Record<DayName, ScheduledClass[]>;
  DAY_ORDER.forEach((day) => (result[day] = []));

  allRawClasses(selection)
    .map((c) => applyOverride(c, overrides))
    .filter((c): c is ScheduledClass => c !== null)
    .forEach((c) => result[c.day].push(c));

  DAY_ORDER.forEach((day) => result[day].sort((a, b) => a.start.localeCompare(b.start)));
  return result;
}

/** Combine the user's selected core/pe1/pe2 sections into one day's schedule, sorted by time, with overrides applied */
export function combinedDaySchedule(selection: SectionSelection, day: DayName, overrides: ClassOverrides = {}): ScheduledClass[] {
  return combinedWeekSchedule(selection, overrides)[day];
}

/** Raw (un-overridden) full week for the selected sections, grouped by ORIGINAL day — used by the
 *  Edit Timetable screen so a moved/removed slot still shows up where you'd expect to find it,
 *  ready to be restored or re-edited. */
export function rawCombinedWeekSchedule(selection: SectionSelection): Record<DayName, ScheduledClass[]> {
  const result = {} as Record<DayName, ScheduledClass[]>;
  const codes = [selection.core, selection.pe1, selection.pe2].filter(Boolean) as string[];
  DAY_ORDER.forEach((day) => {
    result[day] = codes.flatMap((c) => classesForSectionDay(c, day)).sort((a, b) => a.start.localeCompare(b.start));
  });
  return result;
}

/** Distinct subject codes across the user's selected sections (for attendance tab) — based on the
 *  overridden schedule, so a fully-removed class's subject won't appear if it has no data. */
export function allSelectedSubjects(selection: SectionSelection, overrides: ClassOverrides = {}): string[] {
  const week = combinedWeekSchedule(selection, overrides);
  const set = new Set<string>();
  Object.values(week).forEach((classes) => classes.forEach((c) => set.add(c.subject)));
  return Array.from(set).sort();
}
