# EHR application guidance

Read the root [`AGENTS.md`](../../AGENTS.md), this app's [`PRODUCT.md`](PRODUCT.md), and the repository [`README.md`](../../README.md) before changing behavior.

## Product and data boundaries

- This is a single-clinic EHR reference app for the connected Ovok CHF RPM examples.
- Begin in an explicitly synthetic demo. Keep demo state isolated from the authenticated sandbox client; never silently switch to synthetic data on an API error.
- Use `@ovok/core` and supported FHIR R4 interactions for sandbox clinical records. Verify installed declarations and current Ovok docs before using an operation.
- Check authorization through backend responses on every request. A local role, patient assignment, route, or hidden control is not an AccessPolicy.
- Use invitation and account-linking contracts as documented. Never create patient passwords, impersonate a patient, or expose service credentials to the browser.
- Show source, author, timestamp, unit, and FHIR reference when available. Do not diagnose, rank clinical risk, recommend treatment, or claim certification.
- Signals are read-only in this example. Human messaging is FHIR Communication only when allowed by policy; AI assistant sessions are not human messages.
- Keep kit logistics clearly synthetic. Do not invent Ovok APIs or force shipment status into an unsuitable clinical resource.
- Keep one clinic only. Do not add organizations or organization management.

## Code and accessibility

- Keep React components focused and data-access code outside presentation components.
- Follow existing strict TypeScript, Vite, npm workspace, and Turborepo conventions.
- Prefer the smallest complete change, direct dependencies, descriptive names, and explicit loading, empty, and error states.
- Use semantic controls, visible focus, keyboard access, and reduced-motion support.
- New nontrivial domain behavior gets focused tests. Run `npm run check` from the repository root.
- Update this app's README and the capability matrix when setup steps, platform behavior, or limitations change.
