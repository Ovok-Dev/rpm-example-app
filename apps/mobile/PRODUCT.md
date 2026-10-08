# Product

<!-- impeccable:product-schema 1 -->

## Platform

ios

## Stack

Expo + React Native + TypeScript with `@ovok/native` and `@ovok/core`, approved by the user. Build directly in code with the Ovok purple identity.

## Users

Patients completing a CHF remote monitoring routine at home. Developers use this public example alongside Ovok documentation.

## Product Purpose

Make ECG recording, a daily symptom questionnaire, and weight measurement easy to complete and review.

## Capabilities and Constraints

- Four tabs: Home, Diary, Support, Settings.
- Devices: Viatom BP2 for ECG and Viatom F4 / LeScale for weight, following the current Ovok device catalog.
- Working iPhone simulator build; simulator readings must be clearly synthetic and never sent to patient records.
- Sandbox API: `https://api.sandbox.ovok.com`. Tenant code: `public-example`. Patient authentication uses tenant PKCE, never an embedded client secret.
- Manufacturer IFUs remain authoritative. Exact LeScale model is still unconfirmed.
- Real Bluetooth testing requires a physical phone and devices; it cannot be verified in the simulator.
- The questionnaire is an example, not a validated clinical instrument. No automated diagnosis or alert thresholds.

## Brand Commitments

Ovok identity and purple palette. Incredible UI, simple architecture, readable code, and a clean README.

## Evidence on Hand

Empty GitHub repository, official Ovok CHF guide and device catalog, and local iOS simulators. No patient login credentials or hardware supplied.

## Product Principles

- Put today's measurement routine first.
- Clearly distinguish demonstrations from patient data.
- Keep failed saves visible and retryable.
- Prefer the native platform and SDK over custom infrastructure.

## Accessibility & Inclusion

Accessible control labels, 44-point touch targets, scalable system type, safe areas, reduced motion, and light/dark appearances.
