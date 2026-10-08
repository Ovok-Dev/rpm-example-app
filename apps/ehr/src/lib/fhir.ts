import type {
  CarePlan,
  CareTeam,
  Device,
  DeviceUseStatement,
  Patient,
  Practitioner,
} from "@medplum/fhirtypes";
import type { DemoPatient } from "../domain";

export function isFhirLogicalId(value: string): boolean {
  return /^[A-Za-z0-9.-]{1,64}$/.test(value);
}

export function patientName(patient: Patient): string {
  const name = patient.name?.[0];
  const parts = [...(name?.given ?? []), name?.family ?? ""].filter(Boolean);
  return parts.join(" ") || "Patient without a display name";
}

export function patientEmail(patient: Patient): string {
  return patient.telecom?.find((contact) => contact.system === "email")?.value ?? "";
}

export function toFhirPatient(demoPatient: DemoPatient): Patient {
  return {
    resourceType: "Patient",
    active: true,
    identifier: [{ system: "https://example.ovok.com/mrn", value: demoPatient.mrn }],
    name: [{ use: "official", family: demoPatient.lastName, given: [demoPatient.firstName] }],
    gender: demoPatient.sex,
    birthDate: demoPatient.birthDate,
    telecom: [
      { system: "email", value: demoPatient.intake.email, use: "home" },
      { system: "phone", value: demoPatient.intake.phone, use: "mobile" },
    ],
  };
}

export function toCareTeam(
  patient: Patient,
  clinician: Practitioner,
  monitoringNurse?: Practitioner,
): CareTeam {
  return {
    resourceType: "CareTeam",
    status: "active",
    name: "CHF RPM care team",
    subject: patientReference(patient),
    participant: [
      {
        role: [{ text: "Attending physician" }],
        member: practitionerReference(clinician),
      },
      ...(monitoringNurse ? [{
        role: [{ text: "Monitoring nurse" }],
        member: practitionerReference(monitoringNurse),
      }] : []),
    ],
  };
}

export function toCarePlan(patient: Patient, careTeam?: CareTeam): CarePlan {
  return {
    resourceType: "CarePlan",
    status: "active",
    intent: "plan",
    title: "CHF remote patient monitoring",
    description:
      "Clinician-authored enrollment in a CHF remote patient monitoring program.",
    subject: patientReference(patient),
    created: new Date().toISOString(),
    ...(careTeam?.id ? { careTeam: [{ reference: `CareTeam/${careTeam.id}` }] } : {}),
  };
}

export function toDeviceUseStatement(
  patient: Patient,
  device: Device,
): DeviceUseStatement {
  if (!device.id) throw new Error("Choose a device with a FHIR identifier.");
  if (!patient.id) throw new Error("Patient record is missing its FHIR identifier.");

  return {
    resourceType: "DeviceUseStatement",
    status: "active",
    subject: patientReference(patient),
    device: { reference: `Device/${device.id}`, display: deviceName(device) },
    timingPeriod: { start: new Date().toISOString() },
  };
}

export function practitionerName(practitioner: Practitioner): string {
  const name = practitioner.name?.[0];
  return [...(name?.given ?? []), name?.family ?? ""].filter(Boolean).join(" ") ||
    practitioner.id || "Practitioner";
}

export function deviceName(device: Device): string {
  return [device.manufacturer, device.type?.text, device.modelNumber]
    .filter(Boolean)
    .join(" · ") || device.id || "Device";
}

function patientReference(patient: Patient) {
  if (!patient.id) throw new Error("Patient record is missing its FHIR identifier.");
  return { reference: `Patient/${patient.id}`, display: patientName(patient) };
}

function practitionerReference(practitioner: Practitioner) {
  if (!practitioner.id) throw new Error("Practitioner is missing its FHIR identifier.");
  return {
    reference: `Practitioner/${practitioner.id}`,
    display: practitionerName(practitioner),
  };
}
