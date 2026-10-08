# Ovok CHF RPM clinician dashboard

[![npm: @ovok/core](https://img.shields.io/npm/v/@ovok/core?label=%40ovok%2Fcore)](https://www.npmjs.com/package/@ovok/core)
[![CI](https://github.com/Ovok-Dev/rpm-example-app/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/Ovok-Dev/rpm-example-app/actions/workflows/ci.yml)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Node-24%2B-339933?logo=node.js)
![Platform](https://img.shields.io/badge/platform-web-lightgrey)
![Status](https://img.shields.io/badge/example-not_for_clinical_use-orange)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

A documentation example for reviewing a CHF remote-monitoring patient’s ECG, weight, questionnaire, recent activity, and Ovok Signals status. This is a companion to the [Ovok RPM mobile app](../mobile/README.md) and uses the Actimi [Ovok SDK](https://www.npmjs.com/package/@ovok/core).

The app opens in a synthetic demo workspace. A clinician can connect to a single Ovok sandbox project to view its patient records and read-only Signals setup. It has no organizations, clinic switching, or Bluetooth pairing.

> **Example only.** Demo records are synthetic. This application is not for clinical use and does not provide medical advice or clinical decision support. Verify your account, project, policies, devices, and applicable requirements before using any real data.

## What’s included

- **Patient review:** one patient’s latest ECG, body weight, and questionnaire response, with timestamps and source labels.
- **Patients:** a searchable list limited to the current demo or project.
- **Signals setup:** read-only project settings and unacknowledged raw alerts returned through `@ovok/core`.
- **Support:** Ovok documentation and the companion devices’ instructions for use (IFUs).
- **Demo first:** five clearly synthetic patients work without an Ovok account.
- **Sandbox sign-in:** practitioner password sign-in and MFA through the Ovok SDK.

This dashboard reads records after they reach Ovok. The companion mobile app pairs supported devices and sends measurements to Ovok. Signals is accessed only through the Ovok SDK and APIs; the dashboard does not call the Signals service directly or change project settings or acknowledge alerts.

## Run locally

Requirements: Node.js 24 or newer and npm.

From the monorepo root, install once and start this app:

```sh
npm ci
npm run dashboard
```

Open the local URL printed by Vite. The demo workspace works without environment variables.

Copy `apps/dashboard/.env.example` to `apps/dashboard/.env.local` to set the sandbox values explicitly:

```dotenv
VITE_OVOK_API_BASE_URL=https://api.sandbox.ovok.com
VITE_OVOK_TENANT_CODE=public-example
```

Both variables are browser-visible configuration, not secrets. Do not put a ClientApplication secret, client secret, service credential, or patient information in a `VITE_` variable. The sign-in form sends the practitioner’s credentials to `OvokClient.login()`; the app does not separately save the password. The SDK manages the authenticated session.

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dashboard` | Start this app's development server from the workspace root. |
| `npx turbo run typecheck --filter=ovok-rpm-clinician-dashboard` | Run this app's strict TypeScript check. |
| `npm test --workspace=ovok-rpm-clinician-dashboard` | Run this app's unit tests. |
| `npm run build --workspace=ovok-rpm-clinician-dashboard` | Type-check and build the production bundle. |
| `npm run preview:dashboard` | Serve the production bundle locally. |
| `npm run check` | Check and build both workspace apps. |

## Connect an Ovok sandbox project

To try real sandbox records, an administrator needs to prepare one Ovok project and a practitioner account first. This example uses `public-example` by default; replace it with your own project’s tenant code when appropriate.

1. [Create or sign in to an Ovok account](https://ovok.com), then create a sandbox project. Keep this example scoped to that one project.
2. Find the project’s tenant code and confirm practitioner login is enabled. Follow the [project setup guide](https://docs.ovok.com/authentication/project-setup) and [practitioner sign-in guide](https://docs.ovok.com/authentication/practitioner-login).
3. Create or invite a practitioner in that project. Assign an AccessPolicy that allows only the patient and measurement reads the dashboard requires. Check the current [AccessPolicy documentation](https://docs.ovok.com/access-policies).
4. Add the Signals read capabilities `signals_config:read` and `signals_alerts:read` to the practitioner policy. Patient read access still applies to patient-linked results. Use the exact custom rows and least-privilege rules in the [Signals access-policy guide](https://docs.ovok.com/access-policies/signals).
5. Review the [Signals setup and architecture documentation](https://docs.ovok.com/signals) before relying on its project settings or alerts. This screen shows the project’s `episodicAlerts` setting as returned and does not change it.
6. Set `VITE_OVOK_TENANT_CODE` to the project tenant code if it differs from `public-example`, restart Vite, choose **Connect sandbox**, and sign in as the practitioner.

The dashboard reads Patients, Observations, QuestionnaireResponses, Signals settings, and raw Signals alerts via `@ovok/core`. Missing permissions appear as request errors; sandbox data never silently falls back to the synthetic demo. The backend remains the authority for access checks and returned records.

Read the [Ovok web SDK docs](https://docs.ovok.com/web-sdk) and [`@ovok/core` API reference](https://docs.ovok.com/web-sdk/core) when extending integration code. Check the live docs before changing authentication, patient access, Signals behavior, or API calls.

## Devices and IFUs

Device pairing belongs to the companion mobile app, not this dashboard. The mobile example uses the SDK declarations below. LeScale is a device family; confirm the exact model and firmware against the current catalog and the IFU supplied with your device before deployment.

| Device | Companion SDK declaration | Measurement | IFU |
| --- | --- | --- | --- |
| Viatom BP2 | `IntegratedDevices.BP2` | ECG | [BP2 / Armfit instructions for use](https://storage.googleapis.com/public-assets-com-expo-app/instruction-pdf/instruction_armfit.pdf) |
| Viatom F4 / LeScale | `IntegratedDevices.F4` | Body weight | [Scale instructions for use](https://storage.googleapis.com/public-assets-com-expo-app/instruction-pdf/instruction_scales.pdf) |

The current [Ovok supported-device catalog](https://docs.ovok.com/native-sdk/guide/supported-devices) is the source for SDK declarations and manual links. Also check the [Viatom BP2 manufacturer page](https://www.viatomtech.com/bp2) and [Viatom LeScale manufacturer page](https://www.viatomtech.com/bodyscale). Follow the instructions for your exact hardware; catalog-family support alone does not establish compatibility with every model or revision.

## Build and deploy

The app is a static Vite site prepared for [Vercel](https://vercel.com). Create a Vercel project from the monorepo and set its Root Directory to `apps/dashboard`; the build command is configured to use Turborepo. Define the two public `VITE_OVOK_*` variables in that Vercel project. Vercel's [Turborepo deployment guide](https://vercel.com/docs/monorepos/turborepo) explains workspace scoping and deployment settings. Preview the deployment and check the tenant code, practitioner policy, and sandbox behavior before sharing it.

CI runs on pushes and pull requests to `dev` and `main`. See [`AGENTS.md`](AGENTS.md) for repository conventions, [`CLAUDE.md`](CLAUDE.md) for Claude Code guidance, [`CONTRIBUTING.md`](CONTRIBUTING.md) for the local workflow, [`DESIGN.md`](DESIGN.md) for the implemented visual system, and [`DEPENDENCY_NOTICES.md`](DEPENDENCY_NOTICES.md) for direct dependency licensing.

## License

This is Ovok's example clinician dashboard for the Actimi Ovok platform. The original dashboard source in this repository is licensed under [Apache-2.0](LICENSE). The `@ovok/core` package keeps its separate MIT license; this source license does not grant access to Ovok services or rights to Ovok trademarks. Third-party packages and linked device manuals also retain their own terms. See [`DEPENDENCY_NOTICES.md`](DEPENDENCY_NOTICES.md).
