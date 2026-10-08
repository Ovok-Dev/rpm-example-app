export function isFhirLogicalId(value: string): boolean {
  return /^[A-Za-z0-9.-]{1,64}$/.test(value);
}
