import { describe, expect, it } from "vitest";
import type { Device, Patient, Practitioner } from "@medplum/fhirtypes";
import { createInitialDemoState } from "../data/demo";
import { isFhirLogicalId, toCarePlan, toCareTeam, toDeviceUseStatement, toFhirPatient } from "./fhir";

const demoPatient = createInitialDemoState().patients[0];
const patient: Patient = { resourceType: "Patient", id: "patient-example", name: [{ given: ["Avery"], family: "Example" }] };
const doctor: Practitioner = { resourceType: "Practitioner", id: "practitioner-example", name: [{ given: ["Morgan"], family: "Clinician" }] };
const nurse: Practitioner = { resourceType: "Practitioner", id: "nurse-example", name: [{ given: ["Taylor"], family: "Nurse" }] };
const device: Device = { resourceType: "Device", id: "device-example", modelNumber: "BP2" };

describe("FHIR record builders", () => {
  it("accepts only valid FHIR logical IDs for patient links", () => {
    expect(isFhirLogicalId("Patient-1.example")).toBe(true);
  });

  it("rejects URL-controlled strings that are not FHIR logical IDs", () => {
    expect(isFhirLogicalId("Patient/1?access_token=bad")).toBe(false);
  });

  it("maps synthetic demographics into a Patient resource", () => {
    expect(toFhirPatient(demoPatient)).toMatchObject({ resourceType: "Patient", birthDate: demoPatient.birthDate });
  });

  it("assigns clinician roles through CareTeam participants", () => {
    expect(toCareTeam(patient, doctor, nurse).participant).toHaveLength(2);
  });

  it("creates a patient-scoped CHF RPM CarePlan", () => {
    expect(toCarePlan(patient).subject?.reference).toBe("Patient/patient-example");
  });

  it("links only an identified FHIR device to the patient", () => {
    expect(toDeviceUseStatement(patient, device).device.reference).toBe("Device/device-example");
  });

  it("rejects a device without a FHIR id", () => {
    expect(() => toDeviceUseStatement(patient, { resourceType: "Device" })).toThrow("Choose a device with a FHIR identifier.");
  });
});
