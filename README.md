# Ovok CHF RPM example apps

[![CI](https://github.com/Ovok-Dev/rpm-example-app/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/Ovok-Dev/rpm-example-app/actions/workflows/ci.yml)
[![npm: @ovok/native](https://img.shields.io/npm/v/%40ovok%2Fnative?label=%40ovok%2Fnative)](https://www.npmjs.com/package/@ovok/native)
[![npm: @ovok/core](https://img.shields.io/npm/v/%40ovok%2Fcore?label=%40ovok%2Fcore)](https://www.npmjs.com/package/@ovok/core)
![Expo SDK](https://img.shields.io/badge/Expo_SDK-57-000020?logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Node](https://img.shields.io/badge/Node-24%2B-339933?logo=node.js)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
![Status](https://img.shields.io/badge/example-not_for_clinical_use-orange)

Three documentation examples for CHF remote patient monitoring, managed as one npm-workspaces and Turborepo monorepo. The patient mobile app records ECG, weight, and questionnaire readings. The clinician dashboard reviews measurements and read-only Ovok Signals status. The [standalone EHR repository](https://github.com/Ovok-Dev/rpm-ehr-example-app) handles clinic intake, practitioner assignment, and RPM enrollment. It is independently installable and deployable, and is also included at `apps/ehr` in this workspace.

> **Example only.** Demo records are synthetic. These applications are not for clinical use and do not provide medical advice or clinical decision support. Review the current Ovok documentation and validate accounts, project policies, devices, and workflows before using real sandbox data.

| App | Location | Purpose |
| --- | --- | --- |
| [Ovok Care mobile app](apps/mobile/README.md) | `apps/mobile` | Expo and React Native patient experience for ECG, weight, questionnaire, diary, support, and settings. |
| [Clinician dashboard](apps/dashboard/README.md) | `apps/dashboard` | React and Vite patient review, Patients, read-only Signals guidance, and Support. |
| [Ovok EHR example](apps/ehr/README.md) | `apps/ehr` | Standalone React and Vite clinic operations, patient intake, patient charts, care-team assignment, RPM enrollment, and FHIR device-use links. |

## Requirements

- Node.js 24 or newer and npm 11.16.0 (pinned in the root `package.json`).
- Xcode, an installed iOS simulator, and CocoaPods to run the mobile app on iOS.
- Android Studio and an Android emulator or device to run the mobile app on Android.

## Install and run

Install the whole workspace once from the repository root using the pinned npm version:

```sh
npm ci
```

Start all three apps with `npm run dev`, or start one app at a time:

```sh
npm run mobile
npm run dashboard
npm run ehr
```

Run the mobile app in a simulator with `npm run ios` or `npm run android`. The first run generates native projects and installs native dependencies. Use an Expo development build; Expo Go does not contain the mobile app's native modules. Bluetooth device pairing requires a physical phone.

The demo works without an Ovok account. To configure sandbox access, copy each app's example file to its ignored local environment file:

```sh
cp apps/mobile/.env.example apps/mobile/.env
cp apps/dashboard/.env.example apps/dashboard/.env.local
cp apps/ehr/.env.example apps/ehr/.env.local
```

All apps default to `https://api.sandbox.ovok.com` and the `public-example` tenant identifier. These are public configuration values, not credentials. Never place a ClientApplication secret, service credential, patient password, or patient data in an `EXPO_PUBLIC_` or `VITE_` variable. The mobile app needs a patient account; the EHR and dashboard need practitioner accounts. Follow each app's account and least-privilege setup instructions before connecting.

The EHR development server exposes a development-only in-memory relay at `http://localhost:5174/__demo`. It accepts synthetic readings only for the shared `demo-*` identities. The mobile demo posts to it, and the dashboard and EHR read those synthetic records. It has no persistence, is absent from production builds, and is neither an Ovok API nor a clinical backend. The mobile diary keeps its local copy if the relay is offline. Sandbox requests never use this relay.

## Workspace commands

| Command | Result |
| --- | --- |
| `npm run dev` | Run the Expo and both Vite development servers together. |
| `npm run mobile` | Run the Expo development server only. |
| `npm run dashboard` | Run the clinician dashboard only. |
| `npm run ehr` or `npm run dev:ehr` | Run the EHR app and local synthetic relay only. |
| `npm run ios` / `npm run android` | Build and launch the mobile app in a simulator or device. |
| `npm run typecheck` | Type-check all three apps. |
| `npm test` | Run all three apps' unit tests. |
| `npm run build` | Build both web apps and export the mobile iOS JavaScript bundle. |
| `npm run check` | Run type checks, tests, Expo dependency validation, and all app builds/bundles. |

Turborepo caches repeatable checks and build outputs locally. Development servers and native simulator builds remain uncached. The apps stay independent workspaces; shared packages can be added under `packages/` when code is actually shared. The EHR can also be installed and deployed from its own repository using its app-level manifest, lockfile, and README.

## Ovok setup and documentation

Read [docs.ovok.com](https://docs.ovok.com) before changing authentication, access policies, device declarations, measurement writes, or Signals behavior. These are examples, and package typings alone do not replace the platform's current integration guidance.

- [Create an Ovok account and prepare the mobile sandbox](apps/mobile/README.md#create-an-ovok-account-and-set-up-the-sandbox)
- [Prepare practitioner access for the clinician dashboard](apps/dashboard/README.md#connect-an-ovok-sandbox-project)
- [Create an Ovok account, configure AccessPolicies, and connect the EHR](apps/ehr/README.md#sandbox-setup)
- [Ovok Console](https://ovok.com/console)
- [CHF remote monitoring guide](https://docs.ovok.com/guides/chf-remote-monitoring)
- [Native SDK supported-device catalog and IFUs](https://docs.ovok.com/native-sdk/guide/supported-devices)
- [Web SDK documentation](https://docs.ovok.com/web-sdk)

For separate Vercel deployments, create one project with Root Directory `apps/dashboard` and another with Root Directory `apps/ehr`. Set the public `VITE_OVOK_*` values for each project. The mobile app runs with Expo and is not deployed to Vercel. The synthetic relay only runs in the EHR Vite development server. See the [Vercel Turborepo deployment guide](https://vercel.com/docs/monorepos/turborepo).

## License

Original source in this repository is licensed under [Apache-2.0](LICENSE), matching all three app examples. Third-party SDKs retain their own package terms: `@ovok/core` is MIT, while `@ovok/native` has separate proprietary Actimi SDK terms. The source license does not grant SDK distribution rights, access to Ovok services, or trademark rights. See the apps' [mobile dependency notices](apps/mobile/DEPENDENCY_NOTICES.md) and [dashboard dependency notices](apps/dashboard/DEPENDENCY_NOTICES.md).
