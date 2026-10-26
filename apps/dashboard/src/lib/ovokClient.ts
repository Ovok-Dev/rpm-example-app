import type { OvokClient } from "@ovok/core";
import { Ovok } from "@ovok/core/next";

export const apiBaseUrl =
  import.meta.env.VITE_OVOK_API_BASE_URL ?? "https://api.sandbox.ovok.com";

export const tenantCode =
  import.meta.env.VITE_OVOK_TENANT_CODE ?? "public-example";

let client: OvokClient | null = null;

export async function getOvokClient(): Promise<OvokClient> {
  if (client) return client;

  const { OvokClient: OvokClientConstructor } = await import("@ovok/core");
  client = new OvokClientConstructor({
    baseUrl: apiBaseUrl,
    fhirUrlPath: "/fhir/R4/",
    requestTimeoutMs: 15000,
  });
  return client;
}

// Signals moved to the next client; it borrows the signed-in session of the main client.
export function getSignalsClient(signedInClient: OvokClient): Ovok {
  return new Ovok({
    baseUrl: apiBaseUrl,
    tenantCode,
    fetch: async (url, init) => {
      await signedInClient.refreshIfExpired();
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${signedInClient.getAccessToken()}`);
      return fetch(url, { ...init, headers });
    },
  });
}
