import type { ActivityItem, PatientReview, QuestionnaireAnswer, WeightPoint } from "../types";

export interface RelayMeasurement {
  id: string;
  patientId: string;
  kind: "ecg" | "weight" | "questionnaire";
  recordedAt: string;
  source: string;
  value: number | null;
  unit: string | null;
  waveform?: number[];
  durationSeconds?: number;
  answers?: Record<string, string>;
}

const patientIds = new Set(["demo-2048", "demo-1022", "demo-3017", "demo-4011", "demo-1002"]);

export async function loadDemoRelay(): Promise<Record<string, RelayMeasurement[]> | null> {
  const relayUrl = import.meta.env.VITE_DEMO_API_URL ?? "http://localhost:5174/__demo";
  try {
    const response = await fetch(`${relayUrl}/snapshot`, { cache: "no-store", signal: AbortSignal.timeout(2500) });
    if (!response.ok) return null;
    return groupMeasurements(await response.json() as unknown);
  } catch {
    return null;
  }
}

export function withDemoRelayReadings(review: PatientReview, records: RelayMeasurement[] = []): PatientReview {
  const patientRecords = records.filter((record) => record.patientId === review.id)
    .sort((first, second) => Date.parse(second.recordedAt) - Date.parse(first.recordedAt));
  if (!patientRecords.length) return review;

  const ecg = patientRecords.find((record) => record.kind === "ecg");
  const weightRecords = patientRecords.filter((record) => record.kind === "weight" && record.value !== null);
  const questionnaire = patientRecords.find((record) => record.kind === "questionnaire");
  const weightHistory: WeightPoint[] = weightRecords.slice(0, 7).reverse().map((record) => ({
    label: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(record.recordedAt)),
    valueKg: record.value ?? 0,
  }));
  const answers: QuestionnaireAnswer[] = questionnaire?.answers
    ? Object.entries(questionnaire.answers).map(([label, value]) => ({ label: humanize(label), value }))
    : [];
  const activity: ActivityItem[] = patientRecords.slice(0, 12).map((record) => ({
    id: record.id,
    title: record.kind === "ecg" ? "ECG recorded in the mobile demo" : record.kind === "weight" ? "Weight recorded in the mobile demo" : "Questionnaire completed in the mobile demo",
    description: `${record.source} · synthetic local relay`,
    recordedAt: record.recordedAt,
    kind: record.kind,
  }));

  return {
    ...review,
    ecg: ecg ? { recordedAt: ecg.recordedAt, source: ecg.source, durationSeconds: ecg.durationSeconds ?? null, waveform: ecg.waveform ?? null } : review.ecg,
    weight: weightRecords[0] ? {
      recordedAt: weightRecords[0].recordedAt,
      source: weightRecords[0].source,
      valueKg: weightRecords[0].value,
      history: weightHistory,
    } : review.weight,
    questionnaire: questionnaire ? { recordedAt: questionnaire.recordedAt, source: questionnaire.source, answers } : review.questionnaire,
    activity: [...activity, ...review.activity].sort((first, second) => Date.parse(second.recordedAt) - Date.parse(first.recordedAt)).slice(0, 12),
  };
}

function groupMeasurements(value: unknown): Record<string, RelayMeasurement[]> {
  if (!value || typeof value !== "object" || !("measurements" in value) || !Array.isArray(value.measurements)) return {};
  const grouped: Record<string, RelayMeasurement[]> = {};
  for (const item of value.measurements) {
    const record = parseMeasurement(item);
    if (record) grouped[record.patientId] = [...(grouped[record.patientId] ?? []), record];
  }
  return grouped;
}

function parseMeasurement(value: unknown): RelayMeasurement | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<RelayMeasurement>;
  if (typeof record.id !== "string" || typeof record.patientId !== "string" || !patientIds.has(record.patientId) || typeof record.recordedAt !== "string" || Number.isNaN(Date.parse(record.recordedAt)) || typeof record.source !== "string") return null;
  if (record.kind === "weight" && typeof record.value === "number" && Number.isFinite(record.value) && record.value > 0 && record.value <= 500) return { ...record, kind: "weight", value: record.value, unit: "kg" } as RelayMeasurement;
  if (record.kind === "ecg" && Array.isArray(record.waveform) && record.waveform.length <= 2000 && record.waveform.every(Number.isFinite)) return { ...record, kind: "ecg", value: null, unit: null } as RelayMeasurement;
  if (record.kind === "questionnaire" && record.answers && typeof record.answers === "object" && Object.values(record.answers).every((answer) => typeof answer === "string")) return { ...record, kind: "questionnaire", value: null, unit: null } as RelayMeasurement;
  return null;
}

function humanize(value: string): string {
  return value.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").replace(/^./, (first) => first.toUpperCase());
}
