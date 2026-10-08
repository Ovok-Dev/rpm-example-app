import type { Quantity } from "@medplum/fhirtypes";

const POUNDS_PER_KILOGRAM = 2.20462;

export function kilogramsFromQuantity(quantity: Quantity | undefined): number | null {
  const value = quantity?.value;
  const unit = quantity?.code ?? quantity?.unit;
  if (value === undefined || !unit) return null;
  if (unit === "kg" || unit === "kilogram" || unit === "kilograms") return value;
  if (unit === "g" || unit === "gram" || unit === "grams") return value / 1000;
  if (unit === "[lb_av]" || unit === "lb" || unit === "lbs") {
    return value / POUNDS_PER_KILOGRAM;
  }
  return null;
}
