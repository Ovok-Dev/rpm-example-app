# Claude project guide

Read and follow [AGENTS.md](AGENTS.md) for the complete repository instructions. Read [README.md](README.md), [CONTRIBUTING.md](CONTRIBUTING.md), and the relevant source before changing anything. [PRODUCT.md](PRODUCT.md) defines the four-tab patient workflow; [DESIGN.md](DESIGN.md) defines the visual system.

## What this repository is

Ovok Care is an Expo + React Native + TypeScript documentation example for ECG, weight, and an illustrative CHF questionnaire. It opens with synthetic local demo data. Patient sign-in and physical-device saves use the Ovok SDK. This is not a production deployment or a validated clinical instrument.

## Read the current Ovok docs

Use [Ovok documentation](https://docs.ovok.com) as the platform reference. Start with the [AI documentation router](https://docs.ovok.com/llms.txt), then load only the pages relevant to the task. Check [authentication](https://docs.ovok.com/authentication), [project setup](https://docs.ovok.com/authentication/project-setup), and [Access policies](https://docs.ovok.com/access-policies) before changing login or patient writes. For device work, check the [native SDK](https://docs.ovok.com/native-sdk), [device catalog](https://docs.ovok.com/native-sdk/guide/supported-devices), and the exact device IFU. Verify SDK methods against this repository's installed package declarations.

See [Working with AI agents](https://docs.ovok.com/working-with-ai-agents) for guidance on checking integration assumptions. Do not copy a tutorial wholesale: this app has its own local demo, questionnaire, secure persistence, and retry behavior.

## Sandbox and account setup

- API origin: `https://api.sandbox.ovok.com`.
- Example tenant: `public-example`.
- Public configuration lives in `.env.example` and `src/ovok.ts`; README setup must match.
- A new developer should create an Ovok account and obtain a sandbox project using [Ovok](https://ovok.com) and its [Get Started docs](https://docs.ovok.com/#get-started). Follow the README's Console access note if the documented Console link redirects.
- The mobile app signs in a **Patient** account in that sandbox tenant. Developer/administrator accounts and ClientApplication credentials are separate.
- Read the setup docs and describe required administrator work. Do not silently create accounts, enable registration, change policies, or write remote records.

## Preserve these guarantees

Keep demo data out of uploads, tenant and patient scope explicit, and patient readings persisted before server saves. Preserve failed-reading recovery and pending sync states. Keep credentials and real clinical data out of source, client configuration, logs, fixtures, and screenshots. Do not change retention or keychain behavior incidentally.

Use existing components and boundaries; write small readable functions and focused behavior tests. Preserve accessibility, light/dark appearances, and the four tabs. Consult the complete clean-code rules in AGENTS.md.

## Finish honestly

Run the relevant checks from CONTRIBUTING.md. Exercise interface changes in the native simulator; device behavior requires actual hardware. Report untested authentication, permissions, and hardware behavior explicitly.

Keep original app source **Apache-2.0**, update the manifest and lockfile together, and preserve the separate Actimi SDK notice. Keep changes local; pushes, publications, and deployments require an explicit user request. Do not stage or commit unless requested. Report the changed files, completed checks, and any remaining risk.
