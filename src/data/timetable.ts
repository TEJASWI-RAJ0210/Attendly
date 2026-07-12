import sectionsRaw from "../../assets/data/sections.json";
import groupsRaw from "../../assets/data/groups.json";
import { SectionsData, GroupsManifest, DayName, ScheduledClass, SectionSelection, ClassOverrides } from "../types";

export const SECTIONS: SectionsData = sectionsRaw as SectionsData;
export const GROUPS: GroupsManifest = groupsRaw as GroupsManifest;

export const DAY_ORDER: DayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function sectionsInGroup(group: string): string[] {
  return GROUPS.groups[group]?.sections ?? [];
}

export function groupOfSection(code: string): string | undefined {
  return SECTIONS[code]?.group;
}

/** All original (un-overridden) classes for one section on one day, sorted by start time */
function classesForSectionDay(code: string, day: DayName): ScheduledClass[] {
  const sec = SECTIONS[code];
  if (!sec) return [];
  const slots = sec.days[day] ?? [];
  return slots
    .map((s) => ({
      id: `${code}|${day}|${s.start}`,
      sectionCode: code,
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
