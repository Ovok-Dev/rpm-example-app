export type PageId = "home" | "patients" | "signals" | "support";

export type ReadingKind = "ecg" | "weight" | "questionnaire";

export interface PatientChoice {
  id: string;
  name: string;
  synthetic: boolean;
}

export interface WeightPoint {
  label: string;
  valueKg: number;
}

export interface QuestionnaireAnswer {
  label: string;
  value: string;
}

export interface EcgReading {
  recordedAt: string;
  source: string;
  durationSeconds: number | null;
  waveform: number[] | null;
}

export interface WeightReading {
  recordedAt: string;
  source: string;
  valueKg: number | null;
  history: WeightPoint[];
}

export interface QuestionnaireReading {
  recordedAt: string;
  source: string;
  answers: QuestionnaireAnswer[];
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  recordedAt: string;
  kind: ReadingKind;
}

export interface PatientReview {
  id: string;
  name: string;
  initials: string;
  detail: string;
  synthetic: boolean;
  ecg: EcgReading | null;
  weight: WeightReading | null;
  questionnaire: QuestionnaireReading | null;
  activity: ActivityItem[];
}

export interface SignalsSettingsView {
  tenant: "project" | "shared";
  episodicAlerts: boolean;
}

export interface SignalsAlertView {
  id: string;
  patientId: string;
  reason: string;
  status: "ACTIVE" | "RESOLVED";
  acknowledgedAt: string | null;
  createdAt: string;
}
