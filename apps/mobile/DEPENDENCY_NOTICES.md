# Dependency and brand notices

This Ovok-Dev repository contains Ovok's example app for the Actimi Ovok platform and SDK. The original application source is licensed under **Apache-2.0**. See [LICENSE](LICENSE).

Ovok is an Actimi product, and `@ovok/core` and `@ovok/native` are packages in its SDK. They retain their package license terms; the app's Apache license does not change those terms. Other dependencies and linked device instructions also retain their own terms. This repository does not vendor SDK source, native binaries, or manufacturer manuals.

| Software                   | License / terms                                                                  |
| -------------------------- | -------------------------------------------------------------------------------- |
| Expo and React Native      | MIT                                                                              |
| React and React Navigation | MIT                                                                              |
| `@ovok/core`               | MIT; Actimi's Ovok platform SDK                                                  |
| `@medplum/core`            | Apache-2.0                                                                       |
| `@ovok/native`             | Proprietary Actimi SDK terms; separate written permission required               |
| Device IFUs                | Linked external manufacturer documents; their owners retain all rights           |
| Ovok logo                  | Actimi's Ovok brand asset; no trademark rights are granted by the source license |

The project owner confirmed permission to use the Actimi Ovok SDK for this example. That confirmation does **not** sublicense the SDK to downstream users. Obtain the necessary Actimi agreement before using or distributing SDK-containing builds. The Apache license for this application's original source does not alter the SDK's license.

Exact versions are pinned by the monorepo root [package-lock.json](../../package-lock.json). Consult each installed package's license for its full terms. Before distributing a combined binary, review its applicable source and SDK distribution obligations.
