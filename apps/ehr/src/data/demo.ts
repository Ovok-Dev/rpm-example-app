import type {
  DemoAppointment,
  DemoDevice,
  DemoMessage,
  DemoPatient,
  DemoState,
  DemoTask,
  MeasurementRecord,
} from "../domain";

const now = new Date();
const todayAt = (hour: number, minute: number): string => {
  const value = new Date(now);
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
};

const daysAgo = (days: number, hour = 9, minute = 0): string => {
  const value = new Date(now);
  value.setDate(value.getDate() - days);
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
};

const emptyIntake = {
  phone: "",
  email: "",
  address: "",
  emergencyContact: { name: "", relationship: "", phone: "" },
  conditions: [],
  allergies: [],
  medications: [],
  consented: false,
};

export const DEMO_PATIENTS: DemoPatient[] = [
  {
    id: "demo-2048",
    firstName: "Elizabeth",
    lastName: "Lawson",
    birthDate: "1954-04-18",
    sex: "female",
    mrn: "OV-2048",
    intake: {
      ...emptyIntake,
      phone: "+1 555 0148",
      email: "elizabeth.lawson@example.test",
      address: "48 Maple Avenue, Cedar Falls",
      emergencyContact: {
        name: "Jordan Lawson",
        relationship: "Family contact",
        phone: "+1 555 0198",
      },
      conditions: ["Heart failure (patient reported)"],
      allergies: ["No known allergies reported"],
      medications: ["Medication list reviewed with patient"],
      consented: true,
    },
    intakeComplete: true,
    careTeam: {
      clinicianId: "practitioner-sarah-mitchell",
      nurseId: "practitioner-daniel-kim",
      assignedAt: daysAgo(10),
    },
    enrollmentStage: "active",
    enrollmentStart: daysAgo(10),
    monitoringDays: 30,
    deviceIds: ["kit-demo-01"],
    latestActivityAt: todayAt(9, 41),
  },
  {
    id: "demo-1022",
    firstName: "Marcus",
    lastName: "Chen",
    birthDate: "1960-02-09",
    sex: "male",
    mrn: "OV-1022",
    intake: { ...emptyIntake, consented: false },
    intakeComplete: true,
    careTeam: {
      clinicianId: null,
      nurseId: "practitioner-daniel-kim",
      assignedAt: null,
    },
    enrollmentStage: "care-team",
    enrollmentStart: null,
    monitoringDays: 30,
    deviceIds: [],
    latestActivityAt: daysAgo(0, 8, 22),
  },
  {
    id: "demo-3017",
    firstName: "Sandra",
    lastName: "Patel",
    birthDate: "1954-12-02",
    sex: "female",
    mrn: "OV-3017",
    intake: { ...emptyIntake, consented: false },
    intakeComplete: false,
    careTeam: { clinicianId: null, nurseId: null, assignedAt: null },
    enrollmentStage: "intake",
    enrollmentStart: null,
    monitoringDays: 30,
    deviceIds: [],
    latestActivityAt: daysAgo(1, 8, 15),
  },
  {
    id: "demo-4011",
    firstName: "James",
    lastName: "O’Connor",
    birthDate: "1957-08-26",
    sex: "male",
    mrn: "OV-4011",
    intake: { ...emptyIntake, consented: false },
    intakeComplete: true,
    careTeam: {
      clinicianId: "practitioner-sarah-mitchell",
      nurseId: null,
      assignedAt: daysAgo(2),
    },
    enrollmentStage: "program",
    enrollmentStart: null,
    monitoringDays: 30,
    deviceIds: [],
    latestActivityAt: daysAgo(0, 7, 18),
  },
  {
    id: "demo-1002",
    firstName: "Maria",
    lastName: "Rossi",
    birthDate: "1962-06-13",
    sex: "female",
    mrn: "OV-1002",
    intake: { ...emptyIntake, consented: false },
    intakeComplete: true,
    careTeam: {
      clinicianId: "practitioner-sarah-mitchell",
      nurseId: "practitioner-daniel-kim",
      assignedAt: daysAgo(8),
    },
    enrollmentStage: "devices",
    enrollmentStart: null,
    monitoringDays: 30,
    deviceIds: [],
    latestActivityAt: daysAgo(0, 6, 52),
  },
];

const illustrativeWaveform = [
  50, 49, 51, 50, 49, 52, 51, 50, 49, 50, 51, 48, 50, 49, 51, 48, 50, 49,
  51, 47, 49, 50, 48, 50, 49, 47, 52, 50, 48, 51, 50, 46, 48, 50, 50, 48,
  47, 50, 48, 49, 50, 46, 15, 88, 4, 62, 50, 47, 48, 51, 50, 49, 48, 50,
  51, 49, 50, 48, 49, 50, 51, 49, 48, 50, 49, 51, 49, 50, 48, 50, 49, 50,
];

export const DEMO_DEVICES: DemoDevice[] = [
  {
    id: "kit-demo-01",
    name: "CHF kit 01",
    model: "Viatom BP2 + Viatom F4 / LeScale family",
    serialNumber: "SYNTH-BP2-001",
    status: "assigned",
    patientId: "demo-2048",
  },
  {
    id: "kit-demo-02",
    name: "CHF kit 02",
    model: "Viatom BP2 + Viatom F4 / LeScale family",
    serialNumber: "SYNTH-BP2-002",
    status: "available",
    patientId: null,
  },
  {
    id: "kit-demo-03",
    name: "CHF kit 03",
    model: "Viatom BP2 + Viatom F4 / LeScale family",
    serialNumber: "SYNTH-BP2-003",
    status: "available",
    patientId: null,
  },
];

export const DEMO_MEASUREMENTS: MeasurementRecord[] = DEMO_PATIENTS.flatMap(
  (patient, index) => {
    const day = index % 2 === 0 ? 0 : 1;
    const weight = 68.2 + index * 1.7;
    return [
      {
        id: `${patient.id}-ecg-1`,
        patientId: patient.id,
        kind: "ecg",
        recordedAt: todayAt(9, 41 - index * 5),
        source: "Viatom BP2 (synthetic example)",
        value: null,
        unit: null,
        waveform: illustrativeWaveform,
        durationSeconds: 30,
      },
      {
        id: `${patient.id}-weight-1`,
        patientId: patient.id,
        kind: "weight",
        recordedAt: daysAgo(day, 9, 38),
        source: "Viatom F4 / LeScale family (synthetic example)",
        value: Number(weight.toFixed(1)),
        unit: "kg",
      },
      {
        id: `${patient.id}-questionnaire-1`,
        patientId: patient.id,
        kind: "questionnaire",
        recordedAt: todayAt(9, 41 - index * 5),
        source: "Patient questionnaire (synthetic example)",
        value: null,
        unit: null,
        answers: {
          breathing: "As usual",
          swelling: "No swelling",
          sleep: "Comfortably",
        },
      },
    ];
  },
);

export const DEMO_MESSAGES: DemoMessage[] = [
  {
    id: "message-demo-01",
    patientId: "demo-2048",
    sender: "patient",
    text: "I completed today's check-in.",
    sentAt: todayAt(9, 44),
  },
  {
    id: "message-demo-02",
    patientId: "demo-2048",
    sender: "care-team",
    text: "Thank you. Your care team can see the submitted readings.",
    sentAt: todayAt(9, 48),
  },
];

export const DEMO_TASKS: DemoTask[] = [
  {
    id: "task-demo-intake",
    patientId: "demo-3017",
    title: "Complete intake review",
    owner: "Sarah Mitchell",
    dueAt: todayAt(11, 0),
    status: "in-progress",
  },
  {
    id: "task-demo-assignment",
    patientId: "demo-1022",
    title: "Assign attending clinician",
    owner: "Care coordinator",
    dueAt: todayAt(13, 30),
    status: "requested",
  },
  {
    id: "task-demo-kit",
    patientId: "demo-1002",
    title: "Prepare device assignment",
    owner: "Care coordinator",
    dueAt: todayAt(15, 0),
    status: "requested",
  },
];

export const DEMO_APPOINTMENTS: DemoAppointment[] = [
  {
    id: "appointment-demo-01",
    patientId: "demo-2048",
    patientName: "Elizabeth Lawson",
    start: todayAt(10, 0),
    type: "RPM onboarding review",
    status: "booked",
  },
  {
    id: "appointment-demo-02",
    patientId: "demo-1022",
    patientName: "Marcus Chen",
    start: todayAt(11, 30),
    type: "Care-team check-in",
    status: "booked",
  },
  {
    id: "appointment-demo-03",
    patientId: "demo-4011",
    patientName: "James O’Connor",
    start: todayAt(14, 0),
    type: "Clinic appointment",
    status: "booked",
  },
];

export function createInitialDemoState(): DemoState {
  return {
    patients: DEMO_PATIENTS.map((patient) => structuredClone(patient)),
    devices: DEMO_DEVICES.map((device) => structuredClone(device)),
    measurements: structuredClone(DEMO_MEASUREMENTS),
    messages: structuredClone(DEMO_MESSAGES),
    tasks: structuredClone(DEMO_TASKS),
    appointments: structuredClone(DEMO_APPOINTMENTS),
  };
}
