# Claude Code guidance

Follow [`AGENTS.md`](AGENTS.md) for the product boundaries, code conventions, and validation commands in this repository.

Use [Ovok documentation](https://docs.ovok.com) as the platform reference. Start with [project setup](https://docs.ovok.com/authentication/project-setup), [practitioner sign-in](https://docs.ovok.com/authentication/practitioner-login), [AccessPolicies](https://docs.ovok.com/access-policies), and [Signals access policies](https://docs.ovok.com/access-policies/signals) when working on the sandbox integration. Verify SDK method names against the installed `@ovok/core` package and the current [web SDK guide](https://docs.ovok.com/web-sdk).

For Viatom BP2 and LeScale device information, read the current [Ovok supported-device catalog](https://docs.ovok.com/native-sdk/guide/supported-devices) and the exact device IFU. Device pairing belongs to the companion mobile app.

Keep demo data synthetic, the app single-clinic, and Signals settings read-only. Never add credentials or patient details to source files, documentation examples, screenshots, or public Vite environment variables.
