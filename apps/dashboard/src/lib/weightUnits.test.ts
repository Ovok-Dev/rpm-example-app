import { describe, expect, it } from "vitest";
import { kilogramsFromQuantity } from "./weightUnits";

describe("kilogramsFromQuantity", () => {
  it("keeps kilogram values", () => {
    expect(kilogramsFromQuantity({ value: 68.2, code: "kg" })).toBe(68.2);
  });

  it("converts grams to kilograms", () => {
    expect(kilogramsFromQuantity({ value: 68200, code: "g" })).toBe(68.2);
  });

  it("converts pounds to kilograms", () => {
    expect(kilogramsFromQuantity({ value: 150.28, code: "[lb_av]" })).toBeCloseTo(68.17, 1);
  });

  it("leaves unrecognized units undisplayed", () => {
    expect(kilogramsFromQuantity({ value: 68.2, code: "stone" })).toBeNull();
  });
});
