# Ovok EHR example

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Status](https://img.shields.io/badge/example-not_for_clinical_use-orange)

A standalone React and TypeScript reference app for one-clinic CHF RPM operations. It is an independent app in the [RPM examples Turborepo](https://github.com/Ovok-Dev/rpm-example-app) and is published separately at [Ovok-Dev/rpm-ehr-example-app](https://github.com/Ovok-Dev/rpm-ehr-example-app).

> **Example only.** Demo records are synthetic. This app is not for clinical use, is not certified medical software, and does not provide medical advice or clinical decision support.

## What works

- A synthetic operations overview with a five-stage intake-to-monitoring workbench, patient search/filter, and session-only demo actions.
- Patient registration in demo mode; synthetic details remain in browser memory. In sandbox mode, a duplicate email preflight search precedes a real FHIR `Patient` create, followed by the supported `invitePatient` request.
- Practitioner sign-in through `@ovok/core`, including Ovok MFA, with paginated FHIR Patient search and visible request failures.
- Patient charts with demographics, patient-scoped measurements, questionnaire responses, CareTeam, CarePlan, DeviceUseStatement, and Consent status where accessible.
- Sandbox actions that create a FHIR CareTeam, CHF RPM CarePlan, or DeviceUseStatement through the authenticated Ovok SDK client.
- Read-only Signals settings and open alert retrieval through `@ovok/core`.
- Opaque patient-ID links to the RPM dashboard and back. Each application authenticates and checks its own access.
- Synthetic ECG, weight, and questionnaire readings shared with the mobile and dashboard examples through an in-memory EHR development relay, polled every five seconds.

## Run in the Turborepo

Use Node.js 24 or newer and the root pinned npm version. From the monorepo root:

```sh
npm ci
npm run ehr
```

This starts Vite at `http://localhost:5174`. Run the other examples alongside it with `npm run mobile` and `npm run dashboard`; `npm run dev` starts all three. The EHR dev server is required for mobile-to-dashboard synthetic measurement sharing.

## Run as a standalone repository

From the root of this app's checkout:

```sh
npm ci
npm run dev
```

The app scripts are `npm run typecheck`, `npm test`, `npm run build`, and `npm run preview`. Build output is written to `dist/`. In the Turborepo, use the root lockfile and root checks instead of installing from this directory.

## Sandbox setup

1. Create an Ovok account at [ovok.com](https://ovok.com) and a sandbox project in the [Ovok Console](https://ovok.com/console). The example defaults to `https://api.sandbox.ovok.com` and tenant code `public-example`.
2. Read the [project setup guide](https://docs.ovok.com/authentication/project-setup), [FHIR R4 guide](https://docs.ovok.com/api/fhir/r4), and [AccessPolicy documentation](https://docs.ovok.com/access-policies). Configure least-privilege Practitioner and patient-scoped policies. A tenant code is an identifier, not authorization.
3. If inviting patients, configure the invitation feature, patient sharing, the application URL, and the required access policies as described in [Ovok's patient invitation guide](https://docs.ovok.com/invitations/invite-a-patient).
4. Copy `.env.example` to `.env.local` and change public configuration only if your sandbox project differs. Never add a ClientApplication secret, service credential, patient password, or real patient data to a browser-exposed `VITE_` variable.
5. Open **Connect sandbox** and sign in with your practitioner account. The SDK may request an authenticator code. Patient results and every subsequent request remain subject to backend AccessPolicies.

Sandbox patient registration checks for an accessible patient with the submitted email, creates a FHIR Patient, then sends the invitation request. FHIR creation and the invitation are separate requests: if invitation setup fails, the chart may still have been created and the app reports that partial outcome. Ovok's invitation response confirms only that the request was accepted for sending; it does not confirm delivery, account creation, or patient acceptance.

## Supported sandbox writes and limits

The sandbox actions use the installed SDK's generic FHIR create methods to create a `CareTeam`, `CarePlan`, and `DeviceUseStatement`. They do not grant the practitioner access or imply that an assigned device is available. Patient charts show records returned to the current account; there is no switch to another patient account.

The registration form does not collect a legally binding signature or create a Consent record. In sandbox it displays existing accessible Consent status and directs the operator to a validated consent process. Intake questionnaires, conditions, allergies, medications, appointments, task queues, and clinic analytics are not yet persisted as complete workflows. The dashboard displays only patient-page counts in sandbox instead of inventing these metrics.

The sandbox device flow links an actual accessible FHIR `Device` to a patient using `DeviceUseStatement`. It does not implement kit inventory, model compatibility checks, shipping, delivery, returns, or replacement. Demo kit cards use synthetic Viatom BP2 and Viatom F4 / LeScale-family labels; verify the exact scale model and current IFU in the [Native SDK device catalog](https://docs.ovok.com/native-sdk/guide/supported-devices).

Signals is read-only in this app. It does not change project settings, acknowledge alerts, compute risk scores, or recommend treatment. Human messaging and WebSocket subscriptions are not implemented in this EHR UI. The platform's FHIR Communication and subscription capabilities need project access, the WebSocket feature, and an end-to-end recipient authorization test before this example can claim chat behavior. There are no fabricated read receipts, delivery confirmations, or typing indicators.

See the [capability matrix](https://github.com/Ovok-Dev/rpm-example-app/blob/dev/docs/capability-matrix.md), [FHIR mapping](https://github.com/Ovok-Dev/rpm-example-app/blob/dev/docs/fhir-resource-mapping.md), and [connected workflow](https://github.com/Ovok-Dev/rpm-example-app/blob/dev/docs/connected-workflow.md) for verified boundaries. This standalone repository also includes its own [capability-gap report](docs/capability-gaps.md).

## Local synthetic relay

When run with Vite's development server, this app exposes two local routes:

- `GET /__demo/snapshot` returns the shared synthetic measurement fixtures.
- `POST /__demo/measurements` accepts bounded synthetic ECG, weight, or questionnaire records for an allowlist of `demo-*` Patient IDs.

The relay is process-memory only, resets when the EHR development server restarts, validates measurement shape and synthetic source, and uses no database or Ovok service. The mobile app posts a new demo reading to it; the EHR and RPM dashboard poll its snapshot every five seconds. That is local polling, not Ovok real-time messaging. Relay failures never affect the mobile diary's locally saved demo record. The relay is absent from the production build and is not a sandbox fallback.

For the iOS Simulator, the default mobile relay URL is `http://localhost:5174/__demo`. For another simulator/device or a different host, set `EXPO_PUBLIC_DEMO_API_URL` to the development server's reachable address. Only synthetic readings marked as demo can be shared through this relay.

## Deployment

The EHR is an independent static web app. For Vercel from the monorepo, create a separate project with Root Directory `apps/ehr`; for its standalone repository, use the repository root. Vercel uses `npm run build` and serves `dist/`. Set `VITE_OVOK_API_BASE_URL`, `VITE_OVOK_TENANT_CODE`, and optionally `VITE_RPM_DASHBOARD_URL`. The local synthetic relay does not exist in deployment; provide its URL only for a separate development instance when explicitly required, never as a clinical backend.

## License

This app source is licensed under [Apache-2.0](LICENSE). Third-party packages keep their own terms; `@ovok/core` is MIT licensed. The source license grants no access to Ovok services or rights to Ovok marks.
