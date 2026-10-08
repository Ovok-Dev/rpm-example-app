import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { AppState } from "react-native";
import { demoStorage, secureStorage } from "./storage";
import {
  initialDemoDiary,
  isDiaryEntry,
  parseDiary,
  sortDiary,
  type DiaryEntry,
} from "./model";
import { publishDemoEntry, savePatientEntry } from "./ovok";

type CareState = {
  entries: DiaryEntry[];
  loading: boolean;
  loadFailed: boolean;
  syncing: boolean;
  error: string | null;
  today: Date;
  isDemo: boolean;
  patientId?: string;
  record: (entry: DiaryEntry) => Promise<void>;
  retry: () => Promise<void>;
  resetDemo: () => Promise<void>;
};

const CareContext = createContext<CareState | null>(null);

export function CareProvider({
  patientId,
  children,
}: PropsWithChildren<{ patientId?: string }>) {
  const isDemo = !patientId;
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState(new Date());
  const current = useRef<DiaryEntry[]>([]);
  const writes = useRef(Promise.resolve());
  const sending = useRef(new Set<string>());
  const store = isDemo ? demoStorage : secureStorage;
  const key = isDemo ? "ovok.demo.diary" : `ovok.patient.${patientId}.diary`;

  useEffect(() => {
    let active = true;
    void store
      .getItem(key)
      .then(async (raw) => {
        const loaded =
          raw === null && isDemo ? initialDemoDiary() : parseDiary(raw);
        if (!active) return;
        current.current = loaded;
        setEntries(loaded);
      })
      .catch(() => {
        if (active) {
          setLoadFailed(true);
          setError(
            "Your diary could not be loaded. Try reopening the app; your stored records have been kept.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") setToday(new Date());
    });
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => {
      active = false;
      subscription.remove();
      clearInterval(timer);
    };
  }, [key, store, isDemo]);

  function update(
    transform: (records: DiaryEntry[]) => DiaryEntry[],
  ): Promise<void> {
    const operation = writes.current.then(async () => {
      const next = sortDiary(transform(current.current));
      await store.setItem(key, JSON.stringify(next));
      current.current = next;
      setEntries(next);
    });
    writes.current = operation.catch(() => {});
    return operation;
  }

  async function upload(entry: DiaryEntry): Promise<void> {
    if (!patientId || sending.current.has(entry.id)) return;
    sending.current.add(entry.id);
    setSyncing(true);
    try {
      await savePatientEntry(entry, patientId);
      await update((records) =>
        records.map((record) =>
          record.id === entry.id ? { ...record, sync: "saved" } : record,
        ),
      );
      setError(null);
    } catch {
      setError(
        "Your reading is kept securely on this phone. Tap Retry sync when you have a connection.",
      );
    } finally {
      sending.current.delete(entry.id);
      setSyncing(sending.current.size > 0);
    }
  }

  async function record(entry: DiaryEntry): Promise<void> {
    if (loading || loadFailed)
      throw new Error("Wait until your diary is available.");
    if (
      !isDiaryEntry(entry) ||
      (isDemo && entry.source !== "demo") ||
      (!isDemo && entry.source === "demo")
    ) {
      throw new Error("This reading cannot be added to this diary.");
    }
    const existing = current.current.find((record) => record.id === entry.id);
    if (existing?.sync === "saved") return;
    if (!existing)
      await update((records) =>
        records.some((record) => record.id === entry.id)
          ? records
          : [entry, ...records],
      );
    if (!isDemo) {
      await upload(entry);
      return;
    }

    const shared = await publishDemoEntry(entry);
    setError(shared ? null : "Your synthetic check-in is saved on this phone. Start the local EHR demo to share it with the clinician examples.");
  }

  async function retry(): Promise<void> {
    for (const entry of current.current.filter(
      (record) => record.sync === "pending",
    ))
      await upload(entry);
  }

  async function resetDemo(): Promise<void> {
    if (!isDemo) return;
    await update(() => initialDemoDiary());
    setError(null);
  }

  return (
    <CareContext.Provider
      value={{
        entries,
        loading,
        loadFailed,
        syncing,
        error,
        today,
        isDemo,
        patientId,
        record,
        retry,
        resetDemo,
      }}
    >
      {children}
    </CareContext.Provider>
  );
}

export function useCare(): CareState {
  const state = useContext(CareContext);
  if (!state) throw new Error("CareProvider is missing.");
  return state;
}
