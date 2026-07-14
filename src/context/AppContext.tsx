import React, { createContext, useContext, useEffect, useReducer, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AttendanceStatus, PlannerItem, SectionSelection, ClassOverride } from "../types";
import { recordKey } from "../utils/attendance";

const STORAGE_KEY = "attend_native_state_v1";

const initialState: AppState = {
  selection: {},
  records: {},
  planner: [],
  threshold: 75,
  subjectThresholds: {},
  overrides: {},
};

type Action =
  | { type: "LOAD"; state: AppState }
  | { type: "SET_SELECTION"; selection: SectionSelection }
  | { type: "MARK"; subject: string; dateISO: string; start: string; status: AttendanceStatus }
  | { type: "SET_THRESHOLD"; value: number }
  | { type: "SET_SUBJECT_THRESHOLD"; subject: string; value?: number }
  | { type: "ADD_PLANNER"; item: PlannerItem }
  | { type: "TOGGLE_PLANNER_DONE"; id: string }
  | { type: "DELETE_PLANNER"; id: string }
  | { type: "SET_OVERRIDE"; classId: string; override: ClassOverride }
  | { type: "CLEAR_OVERRIDE"; classId: string }
  | { type: "WIPE" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD":
      return action.state;
    case "SET_SELECTION":
      return { ...state, selection: action.selection };
    case "MARK": {
      const key = recordKey(action.subject, action.dateISO, action.start);
      const records = { ...state.records };
      if (records[key] === action.status) {
        delete records[key]; // tapping same status again clears it
      } else {
        records[key] = action.status;
      }
      return { ...state, records };
    }
    case "SET_THRESHOLD":
      return { ...state, threshold: action.value };
    case "SET_SUBJECT_THRESHOLD": {
      const subjectThresholds = { ...state.subjectThresholds };
      if (action.value === undefined) delete subjectThresholds[action.subject];
      else subjectThresholds[action.subject] = action.value;
      return { ...state, subjectThresholds };
    }
    case "ADD_PLANNER":
      return { ...state, planner: [...state.planner, action.item] };
    case "TOGGLE_PLANNER_DONE":
      return {
        ...state,
        planner: state.planner.map((p) => (p.id === action.id ? { ...p, done: !p.done } : p)),
      };
    case "DELETE_PLANNER":
      return { ...state, planner: state.planner.filter((p) => p.id !== action.id) };
    case "SET_OVERRIDE": {
      const overrides = { ...state.overrides, [action.classId]: action.override };
      return { ...state, overrides };
    }
    case "CLEAR_OVERRIDE": {
      const overrides = { ...state.overrides };
      delete overrides[action.classId];
      return { ...state, overrides };
    }
    case "WIPE":
      return initialState;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  loaded: boolean;
}>({ state: initialState, dispatch: () => {}, loaded: false });

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const loadedRef = useRef(false);
  const [loaded, setLoaded] = React.useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          dispatch({ type: "LOAD", state: { ...initialState, ...JSON.parse(raw) } });
        }
      } catch (e) {
        // ignore corrupt storage, start fresh
      } finally {
        loadedRef.current = true;
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return; // don't overwrite storage before initial load completes
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch, loaded }}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
