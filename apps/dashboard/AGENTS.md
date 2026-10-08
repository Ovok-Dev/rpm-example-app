# Repository guidance

This repository is a React + TypeScript + Vite example clinician dashboard for CHF remote patient monitoring. It accompanies the Ovok RPM mobile example and demonstrates the current `@ovok/core` web SDK.

## Product boundaries

- Start in the synthetic demo. Keep demo people, events, ECG traces, and weights explicitly synthetic.
- Support one clinic/project context. Do not add organizations or clinic switching.
- Read patient data and Signals data through `@ovok/core`. Never call Signals directly from this app.
- Keep project Signals settings read-only. Do not update `episodicAlerts`, thresholds, patient enrollment, or alert acknowledgement here.
- Do not infer clinical meaning, diagnose, recommend treatment, or claim certification. Show source and timestamp with measurements.
- Do not pair Bluetooth devices in the dashboard. Device pairing and IFUs belong to the companion app and the current manufacturer instructions.
- Never include secrets or patient records in source, docs, screenshots, browser storage managed by app code, logs, or `VITE_` variables.

## Engineering conventions

- Use the installed SDK and its TypeScript declarations as the API authority. Read the current [Ovok documentation](https://docs.ovok.com) before changing auth, patient reads, Signals, or device guidance.
- Keep components small and focused. Reuse existing styles and helpers before adding packages or abstractions.
- Keep strict TypeScript enabled. Handle unknown API data explicitly and never show unsupported units as kilograms.
- Use semantic HTML, labeled controls, visible focus, keyboard access, and reduced-motion support.
- Keep `apps/dashboard/package.json` and the monorepo root `package-lock.json` in sync. Do not use `--force` or `--legacy-peer-deps` to hide peer conflicts.
- Preserve the app’s selected design direction and update the Impeccable surface brief when the first-view structure or visual system changes.

## Validation

Run `npm run check` from the monorepo root after code changes. Run `npm run dashboard` and verify the browser experience after changing a user-facing workflow. Check both wide and narrow layouts when editing responsive UI.

## Files

- `PRODUCT.md`: agreed product purpose and boundaries.
- `.impeccable/`: visual direction, decision, and approved design comps.
- `src/data/demo.ts`: synthetic patient fixtures only.
- `src/lib/`: Ovok integration and data normalization.
- `src/components/`: app screens and reusable view components.
- `README.md`: onboarding, sandbox setup, devices, and local commands.
