import { describe, expect, it } from "vitest";
import { isFhirLogicalId } from "./fhirId";

describe("FHIR patient link IDs", () => {
  it("accepts valid FHIR logical IDs", () => {
    expect(isFhirLogicalId("Patient-1.example")).toBe(true);
  });

  it("rejects URL-controlled paths and query strings", () => {
    expect(isFhirLogicalId("Patient/1?access_token=bad")).toBe(false);
  });
});
