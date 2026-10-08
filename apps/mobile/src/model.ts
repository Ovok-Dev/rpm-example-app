export type MeasurementKind = "ecg" | "weight" | "questionnaire";
export type Answers = { breathing: string; swelling: string; sleep: string };
export type DiaryEntry = {
  id: string;
  kind: MeasurementKind;
  recordedAt: string;
  source: "demo" | "device" | "questionnaire";
  sync: "local" | "pending" | "saved";
  weight?: number;
  heartRate?: number;
  waveform?: number[];
  duration?: number;
  answers?: Answers;
  device?: {
    id: string;
    name: string;
    localName: string;
    manufacturerData: string;
    model?: string;
    sn: string;
  };
};

export const TASKS = [
  {
    kind: "ecg",
    title: "Record your ECG",
    subtitle: "Viatom BP2 · 30 seconds",
    symbol: "waveform.path.ecg",
  },
  {
    kind: "weight",
    title: "Measure your weight",
    subtitle: "LeScale · About a minute",
    symbol: "scalemass",
  },
  {
    kind: "questionnaire",
    title: "How are you feeling?",
    subtitle: "Daily questionnaire · 3 questions",
    symbol: "list.clipboard",
  },
] as const;

export const QUESTIONS = [
  {
    key: "breathing",
    title: "How is your breathing today?",
    options: ["As usual", "More breathless than usual", "Breathless at rest"],
  },
  {
    key: "swelling",
    title: "Have you noticed swelling in your feet or ankles?",
    options: ["No swelling", "A little swelling", "More swelling than usual"],
  },
  {
    key: "sleep",
    title: "How did you sleep last night?",
    options: ["Comfortably", "Needed extra pillows", "Woke feeling breathless"],
  },
] as const;

export function localDay(date: Date | string): string {
  const value = new Date(date);
  return `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`;
}

export function completedKinds(
  entries: DiaryEntry[],
  now = new Date(),
): Set<MeasurementKind> {
  return new Set(
    entries
      .filter((entry) => localDay(entry.recordedAt) === localDay(now))
      .map((entry) => entry.kind),
  );
}

export function validateAnswers(answers: Partial<Answers>): answers is Answers {
  return QUESTIONS.every((question) =>
    question.options.some((option) => option === answers[question.key]),
  );
}

export function isDiaryEntry(value: unknown): value is DiaryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<DiaryEntry>;
  const validBase =
    typeof entry.id === "string" &&
    typeof entry.recordedAt === "string" &&
    Number.isFinite(Date.parse(entry.recordedAt)) &&
    ["demo", "device", "questionnaire"].includes(entry.source ?? "") &&
    ["local", "pending", "saved"].includes(entry.sync ?? "");
  if (!validBase) return false;
  if (entry.kind === "weight")
    return (
      typeof entry.weight === "number" &&
      Number.isFinite(entry.weight) &&
      entry.weight > 0
    );
  if (entry.kind === "ecg")
    return (
      Array.isArray(entry.waveform) &&
      entry.waveform.length > 1 &&
      entry.waveform.every(
        (point) => typeof point === "number" && Number.isFinite(point),
      ) &&
      typeof entry.duration === "number" &&
      entry.duration > 0
    );
  return (
    entry.kind === "questionnaire" &&
    !!entry.answers &&
    validateAnswers(entry.answers)
  );
}

export function parseDiary(json: string | null): DiaryEntry[] {
  if (json === null) return [];
  const data: unknown = JSON.parse(json);
  if (!Array.isArray(data) || !data.every(isDiaryEntry))
    throw new Error("Stored diary could not be read.");
  return sortDiary(data);
}

export function sortDiary(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort(
    (first, second) =>
      Date.parse(second.recordedAt) - Date.parse(first.recordedAt),
  );
}

export function demoWaveform(): number[] {
  const beat = [
    0, 0.02, 0.06, 0.11, 0.06, 0, 0, -0.07, 0.95, -0.24, 0, 0.02, 0.1, 0.19,
    0.13, 0.04, 0, 0, 0, 0,
  ];
  return Array.from(
    { length: 200 },
    (_, index) => beat[index % beat.length] ?? 0,
  );
}

export function demoEntry(
  kind: MeasurementKind,
  recordedAt = new Date(),
): DiaryEntry {
  const base = {
    id: `demo-${kind}-${recordedAt.getTime()}`,
    kind,
    recordedAt: recordedAt.toISOString(),
    source: "demo" as const,
    sync: "local" as const,
  };
  if (kind === "ecg")
    return { ...base, heartRate: 68, waveform: demoWaveform(), duration: 30 };
  if (kind === "weight") return { ...base, weight: 72.4 };
  return {
    ...base,
    answers: {
      breathing: "As usual",
      swelling: "No swelling",
      sleep: "Comfortably",
    },
  };
}

export function initialDemoDiary(now = new Date()): DiaryEntry[] {
  return [1, 2, 3, 4, 5, 6, 7].flatMap((daysAgo) => {
    const day = new Date(now);
    day.setDate(day.getDate() - daysAgo);
    day.setHours(8, 15, 0, 0);
    return TASKS.map((task) => {
      const entry = demoEntry(task.kind, day);
      return task.kind === "weight"
        ? { ...entry, weight: 72.4 + daysAgo * 0.1 }
        : entry;
    });
  });
}

export function entrySummary(entry: DiaryEntry): string {
  if (entry.kind === "weight") return `${entry.weight?.toFixed(1)} kg`;
  if (entry.kind === "ecg")
    return `${entry.duration} second recording${entry.heartRate ? ` · ${entry.heartRate} bpm` : ""}`;
  return "3 answers recorded";
}
