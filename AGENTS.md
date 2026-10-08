# Repository guidance

This repository contains two Ovok CHF remote patient monitoring examples in npm workspaces: the Expo app in `apps/mobile` and the Vite clinician dashboard in `apps/dashboard`.

## Product boundaries

- Keep demo people, measurements, events, ECG traces, and weights explicitly synthetic.
- The mobile app is patient-facing; the dashboard is clinician-facing and scoped to one project.
- Keep the dashboard's Signals settings read-only. Do not change `episodicAlerts`, thresholds, enrollment, or alert acknowledgements.
- Do not infer a diagnosis, recommend treatment, or claim clinical certification. Preserve measurement sources and timestamps.
- Do not pair Bluetooth devices in the dashboard. Follow the device declaration and exact-model IFU for the mobile app.
- Never commit secrets, patient records, or local `.env` files. `EXPO_PUBLIC_` and `VITE_` values are included in browser or app bundles and must contain public configuration only.

## Engineering conventions

- Use npm workspaces and the single lockfile at the repository root. Run dependency changes from the root and commit the resulting lockfile.
- Use Turborepo for cross-workspace tasks. Keep app-specific behavior and dependencies in the app that owns them.
- Do not create shared packages until code is genuinely shared; native and web UI are separate surfaces.
- Read the current [Ovok documentation](https://docs.ovok.com) before changing authentication, permissions, device integration, or Signals behavior.
- Preserve strict TypeScript, explicit handling of unknown API data, semantic controls, keyboard access, visible focus, and reduced-motion support.
- The mobile app uses Expo SDK 57. Expo's SDK 52+ monorepo support configures Metro automatically; do not add legacy `watchFolders` or manual `nodeModulesPaths` without a demonstrated need. See the [Expo monorepo guide](https://docs.expo.dev/guides/monorepos/).

## Validation

Run `npm run check` from the repository root after changes. It runs both apps' tests and type checks, checks Expo package compatibility, builds the dashboard, and exports the mobile iOS JavaScript bundle. Run `npm run ios` on macOS to verify the simulator experience after native or mobile UI changes; Bluetooth requires a physical phone.

Each app also has focused instructions in `apps/mobile/AGENTS.md` and `apps/dashboard/AGENTS.md`.
