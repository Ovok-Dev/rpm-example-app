import { describe, expect, it } from "vitest";
import { MOBILE_DEMO_SOURCE, parseMobileDemoMeasurement } from "./demoRelay";

const allowedPatients = new Set(["demo-2048"]);
const weightReading = {
  id: "mobile-weight-1",
  patientId: "demo-2048",
  kind: "weight",
  recordedAt: "2026-10-09T08:00:00Z",
  source: MOBILE_DEMO_SOURCE,
  value: 72.4,
};

describe("local mobile demo relay validation", () => {
  it("accepts synthetic measurements for a known demo patient", () => {
    expect(parseMobileDemoMeasurement(weightReading, allowedPatients)?.value).toBe(72.4);
  });

  it("rejects a patient outside the shared demo fixtures", () => {
    expect(parseMobileDemoMeasurement({ ...weightReading, patientId: "patient-unknown" }, allowedPatients)).toBeNull();
  });

  it("rejects any measurement that is not labeled as the synthetic mobile source", () => {
    expect(parseMobileDemoMeasurement({ ...weightReading, source: "Viatom device" }, allowedPatients)).toBeNull();
  });

  it("rejects an unreasonable body weight", () => {
    expect(parseMobileDemoMeasurement({ ...weightReading, value: 1200 }, allowedPatients)).toBeNull();
  });
});
