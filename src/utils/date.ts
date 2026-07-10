import { DayName } from "../types";

// Semester configuration (from user)
export const SEMESTER_START = "2026-07-09"; // 9 July 2026
export const SEMESTER_END = "2026-11-18"; // 18 November 2026

const DAY_NAMES: DayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

/** Mon=0 ... Sun=6 */
export function dayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function dayNameOf(d: Date): DayName | null {
  const idx = dayIndex(d);
  return idx < 5 ? DAY_NAMES[idx] : null; // null for Sat/Sun
}

export function isWeekend(d: Date): boolean {
  const idx = dayIndex(d);
  return idx === 5 || idx === 6;
}

export function isWithinSemester(d: Date): boolean {
  const iso = toISODate(d);
  return iso >= SEMESTER_START && iso <= SEMESTER_END;
}

export const EXAM_PERIODS = [
  { start: "2026-09-07", end: "2026-09-12", label: "Mid-semester exams" },
  { start: "2026-11-09", end: "2026-11-18", label: "End-semester exams" },
];

export function examPeriodOf(d: Date): { start: string; end: string; label: string } | null {
  const iso = toISODate(d);
  return EXAM_PERIODS.find((p) => iso >= p.start && iso <= p.end) ?? null;
}

export function isCollegeDay(d: Date): boolean {
  return !isWeekend(d) && isWithinSemester(d) && !examPeriodOf(d);
}

export function formatHuman(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

export function formatShort(d: Date): string {
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Days remaining until a due date, can be negative if overdue */
export function daysUntil(iso: string): number {
  const today = startOfDay(new Date());
  const target = startOfDay(parseISODate(iso));
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}
