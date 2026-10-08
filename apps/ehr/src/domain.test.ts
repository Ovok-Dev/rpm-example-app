import { describe, expect, it } from "vitest";
import { enrollmentStageFor, validatePatientRegistration } from "./domain";
import { createInitialDemoState } from "./data/demo";

describe("patient registration validation", () => {
  it("accepts a complete registration with a past birth date", () => {
    expect(validatePatientRegistration({
      firstName: "Alex",
      lastName: "Example",
      birthDate: "1980-04-12",
      email: "alex@example.test",
      phone: "+1 555 0100",
    })).toEqual([]);
  });

  it("rejects an impossible date", () => {
    expect(validatePatientRegistration({
      firstName: "Alex",
      lastName: "Example",
      birthDate: "1980-02-31",
      email: "alex@example.test",
      phone: "+1 555 0100",
  })).toContain("Enter a valid date of birth.");
  });

  it("rejects a future birth date", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(validatePatientRegistration({
      firstName: "Alex",
      lastName: "Example",
      birthDate: tomorrow.toISOString().slice(0, 10),
      email: "alex@example.test",
      phone: "+1 555 0100",
    })).toContain("Enter a valid date of birth.");
  });
});

describe("synthetic enrollment stages", () => {
  it("uses the recorded stage unless monitoring has started", () => {
    const patient = createInitialDemoState().patients.find((item) => item.id === "demo-1002");
    expect(patient && enrollmentStageFor(patient)).toBe("devices");
  });

  it("marks a started monitoring period active", () => {
    const patient = createInitialDemoState().patients.find((item) => item.id === "demo-2048");
    expect(patient && enrollmentStageFor(patient)).toBe("active");
  });
});
