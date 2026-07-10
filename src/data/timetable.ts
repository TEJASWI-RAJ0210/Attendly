import sectionsRaw from "../../assets/data/sections.json";
import groupsRaw from "../../assets/data/groups.json";
import { SectionsData, GroupsManifest, DayName, ScheduledClass, SectionSelection } from "../types";

export const SECTIONS: SectionsData = sectionsRaw as SectionsData;
export const GROUPS: GroupsManifest = groupsRaw as GroupsManifest;

export const DAY_ORDER: DayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function sectionsInGroup(group: string): string[] {
  return GROUPS.groups[group]?.sections ?? [];
}

export function groupOfSection(code: string): string | undefined {
  return SECTIONS[code]?.group;
}

/** All classes for one section on one day, sorted by start time */
function classesForSectionDay(code: string, day: DayName): ScheduledClass[] {
  const sec = SECTIONS[code];
  if (!sec) return [];
  const slots = sec.days[day] ?? [];
  return slots.map((s) => ({
    id: `${code}|${day}|${s.start}`,
    sectionCode: code,
    subject: s.subject,
    room: s.room,
    start: s.start,
    end: s.end,
    day,
  }));
}

/** Combine the user's selected core/pe1/pe2 sections into one day's schedule, sorted by time */
export function combinedDaySchedule(selection: SectionSelection, day: DayName): ScheduledClass[] {
  const codes = [selection.core, selection.pe1, selection.pe2].filter(Boolean) as string[];
  const all = codes.flatMap((c) => classesForSectionDay(c, day));
  return all.sort((a, b) => a.start.localeCompare(b.start));
}

/** Combine into a full week, keyed by day */
export function combinedWeekSchedule(selection: SectionSelection): Record<DayName, ScheduledClass[]> {
  const result = {} as Record<DayName, ScheduledClass[]>;
  DAY_ORDER.forEach((day) => {
    result[day] = combinedDaySchedule(selection, day);
  });
  return result;
}

/** Distinct subject codes across the user's selected sections (for attendance tab) */
export function allSelectedSubjects(selection: SectionSelection): string[] {
  const week = combinedWeekSchedule(selection);
  const set = new Set<string>();
  Object.values(week).forEach((classes) => classes.forEach((c) => set.add(c.subject)));
  return Array.from(set).sort();
}
