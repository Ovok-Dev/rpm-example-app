import type { MeasurementRecord } from "../domain";

export const MOBILE_DEMO_SOURCE = "Ovok Care mobile demo";

export function parseMobileDemoMeasurement(
  value: unknown,
  patientIds: ReadonlySet<string>,
): MeasurementRecord | null {
  if (!value || typeof value !== "object" || (value as { source?: unknown }).source !== MOBILE_DEMO_SOURCE) return null;
  return parseDemoMeasurement(value, patientIds);
}

export function parseDemoSnapshot(value: unknown, patientIds: ReadonlySet<string>): MeasurementRecord[] {
  if (!value || typeof value !== "object" || !("measurements" in value) || !Array.isArray(value.measurements)) return [];
  return value.measurements.flatMap((item) => {
    const measurement = parseDemoMeasurement(item, patientIds);
    return measurement ? [measurement] : [];
  });
}

function parseDemoMeasurement(
  value: unknown,
  patientIds: ReadonlySet<string>,
): MeasurementRecord | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<MeasurementRecord>;
  if (
    typeof candidate.id !== "string" || candidate.id.length > 100 ||
    typeof candidate.patientId !== "string" || !patientIds.has(candidate.patientId) ||
    typeof candidate.source !== "string" || candidate.source.length > 120 ||
    typeof candidate.recordedAt !== "string" || Number.isNaN(Date.parse(candidate.recordedAt))
  ) return null;

  if (candidate.kind === "weight") {
    if (typeof candidate.value !== "number" || !Number.isFinite(candidate.value) || candidate.value <= 0 || candidate.value > 500) return null;
    return { id: candidate.id, patientId: candidate.patientId, kind: "weight", recordedAt: candidate.recordedAt, source: candidate.source, value: candidate.value, unit: "kg" };
  }

  if (candidate.kind === "ecg") {
    if (!Array.isArray(candidate.waveform) || candidate.waveform.length < 2 || candidate.waveform.length > 2000 || !candidate.waveform.every((point) => typeof point === "number" && Number.isFinite(point))) return null;
    if (typeof candidate.durationSeconds !== "number" || candidate.durationSeconds <= 0 || candidate.durationSeconds > 300) return null;
    return { id: candidate.id, patientId: candidate.patientId, kind: "ecg", recordedAt: candidate.recordedAt, source: candidate.source, value: null, unit: null, waveform: candidate.waveform, durationSeconds: candidate.durationSeconds };
  }

  if (candidate.kind === "questionnaire") {
    if (!candidate.answers || typeof candidate.answers !== "object") return null;
    const answers = Object.entries(candidate.answers);
    if (answers.length > 20 || answers.some(([key, answer]) => !key || typeof answer !== "string" || answer.length > 500)) return null;
    return { id: candidate.id, patientId: candidate.patientId, kind: "questionnaire", recordedAt: candidate.recordedAt, source: candidate.source, value: null, unit: null, answers: Object.fromEntries(answers) };
  }

  return null;
}
