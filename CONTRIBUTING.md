# Contributing

Use Node.js 24 or newer. Install from the repository root with `npm ci`; the root npm workspaces and lockfile manage both apps.

Run both development servers with `npm run dev`, or use `npm run mobile` and `npm run dashboard` to run one app. Use `npm run ios` or `npm run android` to launch the patient app in a simulator. Read the relevant app `README.md` and `AGENTS.md` before changing a workflow.

Before opening a pull request, run `npm run check` at the root. It runs both TypeScript checks and test suites, validates the Expo dependency set, builds the dashboard, and exports the mobile iOS JavaScript bundle. For mobile native changes, also run the simulator flow in `apps/mobile/tests/simulator.yaml`; a real-device check is needed for Bluetooth pairing.

Keep changes focused, document meaningful behavior changes, and include test or simulator evidence. Never put credentials or real patient records in source, screenshots, fixtures, logs, or environment variables embedded by Expo or Vite.

`dev` is the default integration branch. Open feature branches and target pull requests at `dev`; promote reviewed stable changes to `main`.
