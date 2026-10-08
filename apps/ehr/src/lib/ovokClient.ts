import type { OvokClient } from "@ovok/core";

export const apiBaseUrl =
  import.meta.env.VITE_OVOK_API_BASE_URL ?? "https://api.sandbox.ovok.com";

export const tenantCode = import.meta.env.VITE_OVOK_TENANT_CODE ?? "public-example";

let client: OvokClient | null = null;

export async function getOvokClient(): Promise<OvokClient> {
  if (!client) {
    const { OvokClient: OvokClientConstructor } = await import("@ovok/core");
    client = new OvokClientConstructor({
      baseUrl: apiBaseUrl,
      fhirUrlPath: "/fhir/R4/",
      requestTimeoutMs: 15000,
    });
  }

  return client;
}
