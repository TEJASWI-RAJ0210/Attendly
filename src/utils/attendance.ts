import { AttendanceRecords } from "../types";

export type SubjectStats = {
  present: number;
  absent: number;
  total: number;
  pct: number;
  safeToSkip: number;
  needToAttend: number;
};

/** Compute attendance stats for one subject code from the full records map */
export function subjectStats(subject: string, records: AttendanceRecords, minPct: number): SubjectStats {
  let present = 0;
  let absent = 0;
  for (const key in records) {
    const [subj] = key.split("|");
    if (subj !== subject) continue;
    const val = records[key];
    if (val === "present") present++;
    else if (val === "absent") absent++;
    // cancelled classes are excluded entirely
  }
  const total = present + absent;
  const pct = total === 0 ? 100 : (present / total) * 100;

  let safeToSkip = 0;
  if (minPct < 100 && total > 0) {
    safeToSkip = Math.floor((present * 100) / minPct - total);
  }

  let needToAttend = 0;
  if (pct < minPct) {
    let x = 0;
    while (total + x > 0 && ((present + x) / (total + x)) * 100 < minPct && x < 1000) {
      x++;
    }
    needToAttend = x;
  }

  return { present, absent, total, pct, safeToSkip: Math.max(0, safeToSkip), needToAttend };
}

export function overallStats(subjects: string[], records: AttendanceRecords): { present: number; total: number; pct: number } {
  let present = 0;
  let total = 0;
  subjects.forEach((s) => {
    const st = subjectStats(s, records, 75); // threshold doesn't affect present/total counts
    present += st.present;
    total += st.total;
  });
  return { present, total, pct: total === 0 ? 100 : (present / total) * 100 };
}

export function recordKey(subject: string, dateISO: string, start: string): string {
  return `${subject}|${dateISO}|${start}`;
}
