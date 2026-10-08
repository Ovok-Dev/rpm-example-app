import { ObservationCode, type OvokClient } from "@ovok/core";
import type { Observation, Patient } from "@medplum/fhirtypes";
import { describe, expect, it } from "vitest";
import { loadPatientReview, readingKindForCodes } from "./patientData";

const patient: Patient = {
  resourceType: "Patient",
  id: "patient-1",
  name: [{ given: ["Demo"], family: "Patient" }],
};

describe("readingKindForCodes", () => {
  it("identifies a body-weight observation", () => {
    expect(readingKindForCodes([ObservationCode.BODY_WEIGHT])).toBe("weight");
  });

  it("identifies the BP2 ECG observation", () => {
    expect(readingKindForCodes([ObservationCode.ECG])).toBe("ecg");
  });

  it("does not display a heart-rate value as an ECG recording", () => {
    expect(readingKindForCodes([ObservationCode.ECG_HEART_RATE])).toBeNull();
  });

  it("does not mislabel an unsupported observation", () => {
    expect(readingKindForCodes([ObservationCode.BLOOD_GLUCOSE])).toBeNull();
  });
});

describe("loadPatientReview", () => {
  it("selects the newest ECG by its absolute timestamp", async () => {
    const review = await loadReview([
      ecgObservation("older", "2026-10-08T10:00:00+02:00", "1 2"),
      ecgObservation("newer", "2026-10-08T08:30:00Z", "3 4"),
    ]);

    expect(review.ecg?.recordedAt).toBe("2026-10-08T08:30:00Z");
  });

  it("does not flatten a multi-channel ECG into a single waveform", async () => {
    const review = await loadReview([
      ecgObservation("multichannel", "2026-10-08T08:30:00Z", "1 2 3 4", 2),
    ]);

    expect(review.ecg?.waveform).toBeNull();
  });

  it("calculates sampled ECG duration by sample count", async () => {
    const review = await loadReview([
      ecgObservation("multichannel", "2026-10-08T08:30:00Z", "1 2 3 4", 2),
    ]);

    expect(review.ecg?.durationSeconds).toBe(2);
  });
});

function ecgObservation(
  id: string,
  recordedAt: string,
  data: string,
  dimensions = 1,
): Observation {
  return {
    id,
    effectiveDateTime: recordedAt,
    code: { coding: [{ code: ObservationCode.ECG }] },
    valueSampledData: { data, dimensions, period: 1000 },
  } as Observation;
}

async function loadReview(observations: Observation[]) {
  const client = {
    listPatientMeasurementHistory: async () => observations,
    listPatientQuestionnaireResponses: async () => [],
  } as unknown as OvokClient;

  return loadPatientReview(client, patient);
}
