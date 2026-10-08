import type {
  ActivityItem,
  PatientReview,
  QuestionnaireAnswer,
  WeightPoint,
} from "../types";

const latestCheckIn = "2026-10-08T09:41:00+02:00";
const illustrativeWaveform = [
  50, 49, 51, 50, 49, 52, 51, 50, 49, 50, 51, 48, 50, 49, 51, 48, 50, 49,
  51, 47, 49, 50, 48, 50, 49, 47, 52, 50, 48, 51, 50, 46, 48, 50, 50, 48,
  47, 50, 48, 49, 50, 46, 15, 88, 4, 62, 50, 47, 48, 51, 50, 49, 48, 50,
  51, 49, 50, 48, 49, 50, 51, 49, 48, 50, 49, 51, 49, 50, 48, 50, 49, 50,
];

const baseWeightHistory: WeightPoint[] = [
  { label: "Oct 2", valueKg: 69.8 },
  { label: "Oct 3", valueKg: 69.6 },
  { label: "Oct 4", valueKg: 69.1 },
  { label: "Oct 5", valueKg: 68.8 },
  { label: "Oct 6", valueKg: 68.4 },
  { label: "Oct 7", valueKg: 68.2 },
  { label: "Oct 8", valueKg: 68.2 },
];

const checkInAnswers: QuestionnaireAnswer[] = [
  { label: "Breathlessness · last 24 hours", value: "Mild" },
  { label: "Swelling · ankles or legs", value: "No" },
  { label: "Fatigue", value: "Mild" },
  { label: "Overall wellbeing", value: "Good" },
];

function createActivity(patientId: string): ActivityItem[] {
  return [
    {
      id: `${patientId}-today`,
      title: "Daily check-in completed",
      description: "ECG, weight, and questionnaire recorded.",
      recordedAt: latestCheckIn,
      kind: "questionnaire",
    },
    {
      id: `${patientId}-yesterday`,
      title: "Daily check-in completed",
      description: "ECG, weight, and questionnaire recorded.",
      recordedAt: "2026-10-07T09:12:00+02:00",
      kind: "ecg",
    },
  ];
}

function createDemoPatient(
  id: string,
  name: string,
  detail: string,
  weightKg: number,
  weightHistory: WeightPoint[],
  answers: QuestionnaireAnswer[] = checkInAnswers,
): PatientReview {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("");

  return {
    id,
    name,
    initials,
    detail,
    synthetic: true,
    ecg: {
      recordedAt: latestCheckIn,
      source: "Viatom BP2",
      durationSeconds: 30,
      waveform: illustrativeWaveform,
    },
    weight: {
      recordedAt: "2026-10-08T09:38:00+02:00",
      source: "Viatom F4 / LeScale",
      valueKg: weightKg,
      history: weightHistory,
    },
    questionnaire: {
      recordedAt: latestCheckIn,
      source: "Patient questionnaire",
      answers,
    },
    activity: createActivity(id),
  };
}

const slightlyLowerHistory = baseWeightHistory.map((point) => ({
  ...point,
  valueKg: Number((point.valueKg - 1.1).toFixed(1)),
}));

const slightlyHigherHistory = baseWeightHistory.map((point) => ({
  ...point,
  valueKg: Number((point.valueKg + 0.6).toFixed(1)),
}));

export const DEMO_PATIENTS: PatientReview[] = [
  createDemoPatient(
    "demo-2048",
    "Elizabeth Lawson",
    "72 years · Demo ID OV-2048",
    68.2,
    baseWeightHistory,
  ),
  createDemoPatient(
    "demo-1022",
    "Marcus Chen",
    "66 years · Demo ID OV-1022",
    74.5,
    slightlyHigherHistory,
    [
      { label: "Breathlessness · last 24 hours", value: "None" },
      { label: "Swelling · ankles or legs", value: "No" },
      { label: "Fatigue", value: "Moderate" },
      { label: "Overall wellbeing", value: "Fair" },
    ],
  ),
  createDemoPatient(
    "demo-3017",
    "Sandra Patel",
    "72 years · Demo ID OV-3017",
    62.1,
    slightlyLowerHistory,
    [
      { label: "Breathlessness · last 24 hours", value: "Mild" },
      { label: "Swelling · ankles or legs", value: "No" },
      { label: "Fatigue", value: "None" },
      { label: "Overall wellbeing", value: "Good" },
    ],
  ),
  createDemoPatient(
    "demo-4011",
    "James O’Connor",
    "69 years · Demo ID OV-4011",
    81.4,
    baseWeightHistory,
  ),
  createDemoPatient(
    "demo-1002",
    "Maria Rossi",
    "64 years · Demo ID OV-1002",
    59.7,
    slightlyHigherHistory,
  ),
];

export const DEMO_SIGNALS_SETUP = {
  connected: false,
  description: "Connect a sandbox project to read its Signals setup status.",
} as const;
