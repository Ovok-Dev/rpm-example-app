import { describe, expect, it } from "vitest";
import { DEMO_PATIENTS } from "../data/demo";
import { withDemoRelayReadings } from "./demoRelay";

describe("synthetic mobile-to-dashboard readings", () => {
  it("shows a newer mobile weight in the selected patient review", () => {
    const patient = DEMO_PATIENTS[0]!;
    const review = withDemoRelayReadings(patient, [{
      id: "mobile-weight-1",
      patientId: patient.id,
      kind: "weight",
      recordedAt: "2026-10-09T08:00:00Z",
      source: "Ovok Care mobile demo",
      value: 72.4,
      unit: "kg",
    }]);
    expect(review.weight?.valueKg).toBe(72.4);
  });

  it("keeps the original review when no local mobile readings exist", () => {
    const patient = DEMO_PATIENTS[0]!;
    expect(withDemoRelayReadings(patient).weight).toBe(patient.weight);
  });
});
