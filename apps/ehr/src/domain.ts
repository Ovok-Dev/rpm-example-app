export type WorkspaceMode = "demo" | "sandbox";

export type EnrollmentStage =
  | "intake"
  | "care-team"
  | "program"
  | "devices"
  | "active";

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IntakeDetails {
  phone: string;
  email: string;
  address: string;
  emergencyContact: EmergencyContact;
  conditions: string[];
  allergies: string[];
  medications: string[];
  consented: boolean;
}

export interface CareTeamAssignment {
  clinicianId: string | null;
  nurseId: string | null;
  assignedAt: string | null;
}

export interface DemoDevice {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: "available" | "assigned";
  patientId: string | null;
}

export interface MeasurementRecord {
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

export interface DemoMessage {
  id: string;
  patientId: string;
  sender: "patient" | "care-team";
  text: string;
  sentAt: string;
}

export interface DemoTask {
  id: string;
  patientId: string;
  title: string;
  owner: string;
  dueAt: string;
  status: "requested" | "in-progress" | "completed";
}

export interface DemoAppointment {
  id: string;
  patientId: string;
  patientName: string;
  start: string;
  type: string;
  status: "booked" | "arrived";
}

export interface DemoPatient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  sex: "female" | "male" | "unknown";
  mrn: string;
  intake: IntakeDetails;
  intakeComplete: boolean;
  careTeam: CareTeamAssignment;
  enrollmentStage: EnrollmentStage;
  enrollmentStart: string | null;
  monitoringDays: number;
  deviceIds: string[];
  latestActivityAt: string;
}

export interface DemoState {
  patients: DemoPatient[];
  devices: DemoDevice[];
  measurements: MeasurementRecord[];
  messages: DemoMessage[];
  tasks: DemoTask[];
  appointments: DemoAppointment[];
}

export function patientDisplayName(patient: Pick<DemoPatient, "firstName" | "lastName">): string {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

export function nextEnrollmentAction(stage: EnrollmentStage): string {
  const actions: Record<EnrollmentStage, string> = {
    intake: "Complete patient intake",
    "care-team": "Assign responsible clinicians",
    program: "Start the CHF RPM plan",
    devices: "Assign an available device kit",
    active: "Open patient chart",
  };
  return actions[stage];
}

export function validatePatientRegistration(input: {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
}): string[] {
  const errors: string[] = [];
  if (!input.firstName.trim()) errors.push("Enter the patient's first name.");
  if (!input.lastName.trim()) errors.push("Enter the patient's last name.");
  if (!isValidPastDate(input.birthDate)) {
    errors.push("Enter a valid date of birth.");
  }
  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) {
    errors.push("Enter a valid email address.");
  }
  if (!input.phone.trim()) errors.push("Enter a contact phone number.");
  return errors;
}

function isValidPastDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value &&
    parsed.getTime() <= new Date().setUTCHours(0, 0, 0, 0);
}

export function enrollmentStageFor(patient: DemoPatient): EnrollmentStage {
  if (patient.enrollmentStart) return "active";
  return patient.enrollmentStage;
}
