import type { OvokClient } from "@ovok/core";
import type {
  Observation,
  Patient,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from "@medplum/fhirtypes";
import type {
  ActivityItem,
  EcgReading,
  PatientReview,
  QuestionnaireAnswer,
  QuestionnaireReading,
  ReadingKind,
  WeightPoint,
  WeightReading,
} from "../types";
import { kilogramsFromQuantity } from "./weightUnits";

const PAGE_SIZE = 50;
const BODY_WEIGHT_CODE = "29463-7";
const ECG_CODE = "131328";

export async function listProjectPatients(
  client: OvokClient,
): Promise<Patient[]> {
  const patients = await client.searchResources<"Patient">("Patient", {
    _count: PAGE_SIZE,
    _sort: "family,given",
  });
  return patients.filter((patient) => Boolean(patient.id));
}

export async function loadPatientReview(
  client: OvokClient,
  patient: Patient,
): Promise<PatientReview> {
  const patientReference = `Patient/${patient.id}`;
  const [observations, responses] = await Promise.all([
    client.listPatientMeasurementHistory({
      patient: patientReference,
      _sort: "-date",
      _count: PAGE_SIZE,
    }),
    client.listPatientQuestionnaireResponses({
      patient: patientReference,
      _sort: "-authored",
      _count: 10,
    }),
  ]);

  const sortedObservations = [...observations].sort((first, second) =>
    compareNewestFirst(timestampOf(first), timestampOf(second)),
  );
  const weightObservations = sortedObservations.filter(isWeightObservation);
  const ecgObservation = sortedObservations.find(isEcgObservation) ?? null;
  const weightObservation = weightObservations[0] ?? null;
  const questionnaireResponse = [...responses].sort((first, second) =>
    compareNewestFirst(responseTimestamp(first), responseTimestamp(second)),
  )[0] ?? null;

  return {
    id: patient.id ?? patientReference,
    name: patientName(patient),
    initials: patientInitials(patientName(patient)),
    detail: patientDetail(patient),
    synthetic: false,
    ecg: ecgObservation ? toEcgReading(ecgObservation) : null,
    weight: weightObservation
      ? toWeightReading(weightObservation, weightObservations)
      : null,
    questionnaire: questionnaireResponse
      ? toQuestionnaireReading(questionnaireResponse)
      : null,
    activity: buildActivity(sortedObservations, responses),
  };
}

function patientName(patient: Patient): string {
  const name = patient.name?.[0];
  const parts = [...(name?.given ?? []), name?.family ?? ""].filter(Boolean);
  return parts.join(" ") || "Patient without a display name";
}

function patientInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("");
}

function patientDetail(patient: Patient): string {
  const age = patient.birthDate ? patientAge(patient.birthDate) : null;
  const details = [patient.gender, age === null ? "" : `${age} years`];
  return details.filter(Boolean).join(" · ") || "Patient profile";
}

function patientAge(birthDate: string): number | null {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  const hasHadBirthdayThisYear =
    now.getMonth() > birth.getUTCMonth() ||
    (now.getMonth() === birth.getUTCMonth() &&
      now.getDate() >= birth.getUTCDate());
  const age = now.getFullYear() - birth.getUTCFullYear();
  return hasHadBirthdayThisYear ? age : age - 1;
}

function observationCodes(observation: Observation): string[] {
  return observation.code?.coding
    ?.map((coding) => coding.code)
    .filter((code): code is string => Boolean(code)) ?? [];
}

function isWeightObservation(observation: Observation): boolean {
  return observationCodes(observation).includes(BODY_WEIGHT_CODE);
}

function isEcgObservation(observation: Observation): boolean {
  return observationCodes(observation).includes(ECG_CODE);
}

function timestampOf(observation: Observation): string {
  return observation.effectiveDateTime ??
    observation.effectivePeriod?.start ??
    observation.issued ??
    observation.meta?.lastUpdated ??
    "";
}

function responseTimestamp(response: QuestionnaireResponse): string {
  return response.authored ?? response.meta?.lastUpdated ?? "";
}

function compareNewestFirst(first: string, second: string): number {
  return Date.parse(second) - Date.parse(first);
}

function observationSource(observation: Observation): string {
  return observation.device?.display ?? "Device information from Ovok";
}

function toEcgReading(observation: Observation): EcgReading {
  const sampledData = observation.valueSampledData;
  const waveform = sampledData?.data
    ?.trim()
    .split(/\s+/)
    .map(Number)
    .filter(Number.isFinite) ?? [];
  const dimensions = sampledData?.dimensions ?? 1;
  const durationSeconds = sampledData?.period && dimensions > 0 && waveform.length
    ? (waveform.length / dimensions) * sampledData.period / 1000
    : null;
  return {
    recordedAt: timestampOf(observation),
    source: observationSource(observation),
    durationSeconds,
    waveform: dimensions === 1 && waveform.length ? waveform : null,
  };
}

function weightHistory(observations: Observation[]): WeightPoint[] {
  return observations
    .filter(isWeightObservation)
    .slice(0, 7)
    .reverse()
    .flatMap((observation) => {
      const valueKg = kilogramsFromQuantity(observation.valueQuantity);
      return valueKg === null ? [] : [{
        label: formatDay(timestampOf(observation)),
        valueKg,
      }];
    });
}

function formatDay(timestamp: string): string {
  if (!timestamp) return "Date unavailable";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

function toWeightReading(
  observation: Observation,
  history: Observation[],
): WeightReading {
  return {
    recordedAt: timestampOf(observation),
    source: observationSource(observation),
    valueKg: kilogramsFromQuantity(observation.valueQuantity),
    history: weightHistory(history),
  };
}

function answerValue(answer: QuestionnaireResponseItemAnswer): string | null {
  if (answer.valueString !== undefined) return answer.valueString;
  if (answer.valueBoolean !== undefined) return answer.valueBoolean ? "Yes" : "No";
  if (answer.valueInteger !== undefined) return String(answer.valueInteger);
  if (answer.valueDecimal !== undefined) return String(answer.valueDecimal);
  if (answer.valueQuantity?.value !== undefined) {
    return `${answer.valueQuantity.value} ${answer.valueQuantity.unit ?? ""}`.trim();
  }
  if (answer.valueCoding?.display) return answer.valueCoding.display;
  return null;
}

function questionnaireAnswers(items: QuestionnaireResponseItem[] = []): QuestionnaireAnswer[] {
  const answers: QuestionnaireAnswer[] = [];
  for (const item of items) {
    const label = item.text ?? item.linkId;
    for (const answer of item.answer ?? []) {
      const value = answerValue(answer);
      if (value) answers.push({ label, value });
      answers.push(...questionnaireAnswers(answer.item));
    }
    answers.push(...questionnaireAnswers(item.item));
  }
  return answers;
}

function toQuestionnaireReading(
  response: QuestionnaireResponse,
): QuestionnaireReading {
  return {
    recordedAt: responseTimestamp(response),
    source: "Patient questionnaire",
    answers: questionnaireAnswers(response.item),
  };
}

function buildActivity(
  observations: Observation[],
  responses: QuestionnaireResponse[],
): ActivityItem[] {
  const measurementActivity = observations.flatMap((observation) => {
    const kind = readingKindForCodes(observationCodes(observation));
    if (!kind) return [];

    const description = kind === "weight"
      ? "Weight reading recorded in Ovok."
      : "ECG reading recorded in Ovok.";
    return {
      id: observation.id ?? `${kind}-${timestampOf(observation)}`,
      title: `${kind.toUpperCase()} recorded`,
      description,
      recordedAt: timestampOf(observation),
      kind,
    } satisfies ActivityItem;
  });
  const questionnaireActivity = responses.map((response) => ({
    id: response.id ?? `questionnaire-${responseTimestamp(response)}`,
    title: "Questionnaire completed",
    description: "Patient response saved in Ovok.",
    recordedAt: responseTimestamp(response),
    kind: "questionnaire" as const,
  }));

  return [...measurementActivity, ...questionnaireActivity]
    .sort((first, second) => compareNewestFirst(first.recordedAt, second.recordedAt))
    .slice(0, 8);
}

export function readingKindForCodes(codes: string[]): ReadingKind | null {
  if (codes.includes(BODY_WEIGHT_CODE)) return "weight";
  if (codes.includes(ECG_CODE)) return "ecg";
  return null;
}
