export type DayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export type RawSlot = {
  start: string; // "HH:MM"
  end: string;
  subject: string;
  room: string;
};

export type RawSection = {
  group: string;
  code: string; // bare section code for display, e.g. "CS15" (the map key is "group|code" to stay unique across semesters)
  days: Record<string, RawSlot[]>;
};

export type SectionsData = Record<string, RawSection>;

export type GroupsManifest = {
  groups: Record<string, { category: "core" | "pe1" | "pe2"; sections: string[] }>;
  categories: { core: string[]; pe1: string[]; pe2: string[] };
};

export type SectionSelection = {
  core?: string; // composite key "group|code" e.g. "CS-S5|CS15"
  pe1?: string; // e.g. "HPC-S5-PE1|HPC11"
  pe2?: string; // e.g. "CD-S5-PE2|CD8"
};

// A concrete scheduled class occurrence, combined from up to 3 sections
export type ScheduledClass = {
  id: string; // stable id: sectionCode|day|start
  sectionCode: string;
  subject: string;
  room: string;
  start: string;
  end: string;
  day: DayName;
};

export type AttendanceStatus = "present" | "absent" | "cancelled";

// key: `${subject}|${dateISO}|${start}`
export type AttendanceRecords = Record<string, AttendanceStatus>;

export type PlannerItem = {
  id: string;
  subject: string;
  title: string;
  type: "assignment" | "test";
  dueDate: string; // ISO date YYYY-MM-DD
  done: boolean;
};

export type ClassOverride = {
  room?: string;
  start?: string;
  end?: string;
  day?: DayName; // move this class to a different day of the week
  removed?: boolean;
};

// key: same as ScheduledClass.id -> `${sectionCode}|${day}|${originalStart}`
export type ClassOverrides = Record<string, ClassOverride>;

export type AppState = {
  selection: SectionSelection;
  records: AttendanceRecords;
  planner: PlannerItem[];
  threshold: number; // global minimum attendance %
  subjectThresholds: Record<string, number>; // per-subject override
  overrides: ClassOverrides; // room/timing corrections or removals
};
