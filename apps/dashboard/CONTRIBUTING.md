# Contributing

Thank you for improving this Ovok documentation example. Keep changes small and make the clinician flow easy for the next developer to understand.

## Local workflow

1. Use Node.js 24 or newer.
2. From the monorepo root, run `npm ci` to install the lockfile’s exact dependency versions.
3. Run `npm run dashboard` at the root to open the synthetic workspace in a browser.
4. Add or update focused tests for non-trivial data handling or behavior.
5. Run `npm run check` from the root before requesting review.

## Review checklist

- Demo people, readings, and ECG traces remain clearly synthetic.
- Live data is read through the supported `@ovok/core` client and is not replaced with demo data after an error.
- Measurement values retain their source, timestamp, and known units.
- Signals settings remain read-only and alerts are not acknowledged by this example.
- The app keeps one clinic context and does not introduce organization management.
- Controls work by keyboard and have accessible names; narrow layouts remain usable.
- README and support links point to current Ovok docs and exact manufacturer IFUs.
- No secrets, tokens, or real patient data are added to the repository.
