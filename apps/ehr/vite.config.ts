import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { DEMO_PATIENTS, createInitialDemoState } from "./src/data/demo";
import { MOBILE_DEMO_SOURCE, parseMobileDemoMeasurement } from "./src/lib/demoRelay";

export default defineConfig({
  plugins: [react(), syntheticDemoRelay()],
  server: {
    cors: true,
  },
});

function syntheticDemoRelay(): Plugin {
  const state = createInitialDemoState();
  const patientIds = new Set(DEMO_PATIENTS.map((patient) => patient.id));

  return {
    name: "ovok-synthetic-demo-relay",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? "/", "http://localhost");
        if (!url.pathname.startsWith("/__demo/")) return next();

        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setHeader("Cache-Control", "no-store");
        if (request.method === "OPTIONS") {
          response.statusCode = 204;
          response.end();
          return;
        }

        if (url.pathname === "/__demo/snapshot" && request.method === "GET") {
          sendJson(response, 200, { measurements: state.measurements });
          return;
        }

        if (url.pathname === "/__demo/measurements" && request.method === "POST") {
          try {
            const payload = await readJsonBody(request);
            const measurement = parseMobileDemoMeasurement(payload, patientIds);
            if (!measurement || measurement.source !== MOBILE_DEMO_SOURCE) {
              sendJson(response, 400, { error: "Expected a valid synthetic mobile measurement for a shared demo patient." });
              return;
            }

            const existing = state.measurements.find((item) => item.id === measurement.id);
            if (existing) {
              sendJson(response, 200, { stored: false, id: existing.id });
              return;
            }

            state.measurements.unshift(measurement);
            sendJson(response, 201, { stored: true, id: measurement.id });
          } catch (error) {
            sendJson(response, 400, { error: error instanceof Error ? error.message : "Invalid request body." });
          }
          return;
        }

        sendJson(response, 404, { error: "This local synthetic endpoint was not found." });
      });
    },
  };
}

async function readJsonBody(request: import("node:http").IncomingMessage): Promise<unknown> {
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  for await (const chunk of request) {
    const bytes = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    byteLength += bytes.byteLength;
    if (byteLength > 65536) throw new Error("Request body exceeds the local demo limit.");
    chunks.push(bytes);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function sendJson(response: import("node:http").ServerResponse, status: number, body: unknown): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}
