import {
  createClientStorage,
  OvokClient,
  MeasurementTypeKey,
  type BodyWeightMeasurement,
  type EcgMeasurement,
} from "@ovok/core";
import type { QuestionnaireResponse } from "@medplum/fhirtypes";
import { secureStorage } from "./storage";
import { QUESTIONS, type DiaryEntry } from "./model";

export const tenantCode =
  process.env.EXPO_PUBLIC_TENANT_CODE ?? "public-example";
export const apiUrl =
  process.env.EXPO_PUBLIC_OVOK_BASE_URL ?? "https://api.sandbox.ovok.com";
const storage = createClientStorage(secureStorage, [
  "activeLogin",
  "logins",
  "ovok.core.expired-accounts",
]);

export const ovokClient = new OvokClient({
  baseUrl: apiUrl,
  fhirUrlPath: "/fhir/R4/",
  storage,
  requestTimeoutMs: 15000,
});

export async function savePatientEntry(
  entry: DiaryEntry,
  patientId: string,
): Promise<void> {
  if (entry.source === "demo")
    throw new Error("Demo records cannot be uploaded.");
  if (ovokClient.getProfile()?.id !== patientId)
    throw new Error("Sign in to this patient's account before syncing.");
  if (entry.kind === "questionnaire") {
    const response: QuestionnaireResponse = {
      resourceType: "QuestionnaireResponse",
      id: entry.id,
      status: "completed",
      subject: { reference: `Patient/${patientId}` },
      authored: entry.recordedAt,
      item: QUESTIONS.map((question) => ({
        linkId: question.key,
        text: question.title,
        answer: [{ valueString: entry.answers?.[question.key] }],
      })),
    };
    // A stable resource ID makes a retry update the same response.
    await ovokClient.updateResource(response);
    return;
  }
  const measurement: BodyWeightMeasurement | EcgMeasurement =
    entry.kind === "weight"
      ? {
          measurementTypeKey: MeasurementTypeKey.bodyWeight,
          bodyWeight: entry.weight!,
          recordedAt: new Date(entry.recordedAt),
        }
      : {
          measurementTypeKey: MeasurementTypeKey.ecg,
          diagramPoints: entry.waveform,
          duration: entry.duration,
          heartRate: entry.heartRate,
          recordedAt: new Date(entry.recordedAt),
        };
  await ovokClient.saveMeasurement({
    patientId,
    effectiveDateTime: new Date(entry.recordedAt),
    device: entry.device,
    measurement,
  });
}
