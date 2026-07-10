# Attendly

A personal timetable and attendance tracker for KIIT CSE Semester 5 — built with React Native and Expo, so it runs as a real Android app, an iOS app, and a website from a single codebase.

Full section timetable (Core + every PE1/PE2 elective group, 190 sections in total) is parsed directly from the official Excel sheet and baked into the app — just pick your three sections once and you're done.

**Developed by Tejaswi**

---

## Features

- **Today** — combined daily schedule across your Core + PE1 + PE2 sections, with room numbers. Jump to any date, past or future, via the day strip or calendar picker, and mark attendance for any past day.
- **Weekly** — full week view across all three sections side by side.
- **Attendance** — a live ring per subject showing current percentage, plus a "can skip N more" or "attend next N" projection against your minimum required attendance (default 75%, adjustable globally or per subject).
- **Planner** — track assignments and tests per subject with a due date. Items due within 3 days, or already overdue, are flagged automatically.
- **Sections** — change your Core / PE1 / PE2 sections at any time.
- **Settings** — adjust your attendance threshold, export a full data backup to clipboard, or erase all data.

The app automatically accounts for:
- **Semester window:** 9 Jul 2026 – 18 Nov 2026
- **Weekly off days:** Saturday & Sunday
- **Exam periods (no classes shown):** Mid-semester exams (7–12 Sep 2026), End-semester exams (9–18 Nov 2026)

## Design

Slate/charcoal background with a single warm burnt-orange accent.

## Tech Stack

- [Expo](https://expo.dev) (SDK 54) + [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- React Native + React Native Web — one codebase, three platforms
- `AsyncStorage` for on-device data persistence (no backend, no login, no network calls)
- `react-native-svg` for the attendance rings
- `react-native-safe-area-context` for safe-area/notch handling

## Data & Storage

All your data — selected sections, attendance records, planner items, and settings — is stored locally on the device using `AsyncStorage` (which maps to native storage on Android/iOS and to `localStorage` on web). There is no server and no account system, so:

- Data is **not synced** between devices — installing the app on both your phone and a browser gives you two independent copies.
- Use **Settings → Export data** to copy a full JSON backup to your clipboard at any time.

---

## Getting Started

```bash
npm install
npx expo start
```

- Press `w` to open the app in your browser
- Scan the QR code with the **Expo Go** app (App Store / Play Store) to run it on your phone instantly — no build required for development

> **Note:** Expo Go only supports one SDK version at a time (whatever's current on the app stores). If you see an SDK mismatch error, run `npx expo install --fix` to align your project's dependencies with your installed Expo Go version.

---

## Project Structure

```
app/                       Expo Router screens (file-based routing)
  (tabs)/
    index.tsx               Today
    weekly.tsx               Weekly
    attendance.tsx           Attendance
    planner.tsx              Planner
  sections.tsx              modal — choose Core/PE1/PE2
  settings.tsx               modal — threshold, export, wipe
  add-planner-item.tsx        modal — new assignment/test
  _layout.tsx                 root layout (providers, stack)

src/
  theme.ts                   colors, spacing, radius — edit here to retheme
  types.ts
  data/timetable.ts           loads and queries assets/data/*.json
  context/AppContext.tsx      persisted app state (AsyncStorage)
  utils/date.ts                semester dates, weekday logic, exam periods
  utils/attendance.ts          attendance % / safe-to-skip math
  components/                 Header, Ring, ClassRow, FieldPicker, CalendarPicker

assets/data/
  sections.json               full timetable, parsed from the source Excel file
  groups.json                  section groupings (core / pe1 / pe2 categories)
```

## Attendance Math

For each subject, the app tracks `present` and `absent` counts (cancelled classes are excluded entirely). From that:

- **Current %** = `present / (present + absent) × 100`
- **Safe to skip** = the number of additional classes you could mark absent while staying at or above your minimum threshold
- **Attend next N** = the number of classes you'd need to attend consecutively to climb back up to your minimum threshold, if you're currently below it

## Updating Timetable Data

If a new semester's Excel sheet is issued, the parsing script that generated `assets/data/sections.json` and `groups.json` can be re-run against the new file to regenerate both — no app code changes required.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Expo Go says SDK mismatch | `npx expo install --fix`, then restart with `npx expo start` |
| Duplicate/conflicting dependency versions after an SDK bump | Delete `node_modules` and the lockfile, then `npx expo install --fix` followed by `npm install` |
| `Cannot find module 'babel-preset-expo'` | `npx expo install babel-preset-expo`, then `npx expo start -c` to clear the bundler cache |
| `npm install` fails with `ERESOLVE` peer dependency errors | `npm install --legacy-peer-deps`, then `npx expo install --fix` |
| Unsure what's wrong | `npx expo-doctor` — Expo's built-in project diagnostic |

---

## License / Credits

Built for personal use by **Tejaswi**. Timetable data sourced from the official KIIT CSE Semester 5 schedule.