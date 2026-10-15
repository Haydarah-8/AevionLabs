# Open-source licenses (Website Factory / editor stack)

This document lists licenses for dependencies **actually used** by Aevion today, plus licenses relevant to the **planned** VvvebJs editor integration. It is not legal advice; escalate incompatible use for review before redistributing.

## Aevion application

| Item                            | Notes                                                                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aevion Labs app (`aevion-labs`) | Private package (`"private": true` in `package.json`). No root `LICENSE` file in repo at audit time — confirm distribution model before shipping proprietary + OSS combinations. |

## Runtime dependencies (selected)

From `package.json` (verify each package’s `LICENSE` on upgrade):

| Package                                   | Typical license                    | Role                                  |
| ----------------------------------------- | ---------------------------------- | ------------------------------------- |
| `next`                                    | MIT                                | Framework                             |
| `react` / `react-dom`                     | MIT                                | UI                                    |
| `@puckeditor/core`                        | MIT (confirm on version)           | **Current** visual editor             |
| `@supabase/supabase-js` / `@supabase/ssr` | Apache-2.0 / MIT (per package)     | Backend client                        |
| `zod`                                     | MIT                                | Validation                            |
| `jszip`                                   | MIT / GPL dual — **use MIT terms** | ZIP export                            |
| `jsdom` / `linkedom`                      | MIT                                | HTML parsing (scrape)                 |
| `@mozilla/readability`                    | Apache-2.0                         | Article extraction                    |
| `framer-motion`                           | MIT                                | Marketing/site motion                 |
| `cmdk`                                    | MIT                                | Command palette                       |
| `@radix-ui/react-dialog`                  | MIT                                | Dialogs                               |
| `lucide-react`                            | ISC                                | Icons                                 |
| `tailwind-merge` / `clsx`                 | MIT                                | Classnames                            |
| `@blocknote/*`                            | MPL-2.0 (BlockNote)                | Agency blog editor (not factory Puck) |
| `@vercel/speed-insights`                  | Apache-2.0                         | Insights                              |

Always re-check with `npm license` / package LICENSE files before release.

## Installed: VvvebJs (editor engine only)

| Project                                                                         | License                | Use in Aevion                                                                                                                         |
| ------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **[VvvebJs](https://github.com/givanz/VvvebJs)** (`vvvebjs@2.0.9`)              | **Apache License 2.0** | Editor kernel. Assets served from `node_modules/vvvebjs` via `/vvvebjs/[...path]`. License text: `docs/legal/VVVEBJS-APACHE-2.0.txt`. |
| **[@vvvebjs/react](https://github.com/VvvebJs/react)** (`@vvvebjs/react@0.0.4`) | Apache-2.0             | Reference wrapper (Vite-oriented). Aevion uses Next-adapted `VvvebEngine` instead of mounting this package directly.                  |
| **Vvveb CMS** (full PHP/MySQL CMS)                                              | **Separate project**   | **Out of scope.** Prefer VvvebJs library only.                                                                                        |

### Prototype entry

- Studio: `/admin/websites/test/editor`
- Engine: `src/lib/editor/vvveb-engine.ts`
- Persistence: **browser localStorage only** (not production DB)

### Apache-2.0 obligations (summary)

When copying or modifying VvvebJs source into this repo or shipping redistributable builds that include it:

1. Include the Apache-2.0 license text.
2. Preserve copyright, patent, trademark, and attribution notices.
3. If a `NOTICE` file exists upstream, include its attributions in distributions.
4. Modified files should carry prominent change notices where required.
5. Do not use “Vvveb” trademarks in a way that implies endorsement without permission.

Place retained notices under e.g. `third_party/vvvebjs/NOTICE` when vendoring.

## Explicit non-goals

- Do not vendor Vvveb CMS PHP backend into Aevion.
- Do not mix GPL-only assets into the proprietary app without a clearance decision (`jszip` is dual-licensed — stick to MIT).
- Do not strip license headers from copied editor files.

## Integration decision record

| Date       | Decision                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-09-19 | Proceed with **VvvebJs (Apache-2.0)** as a candidate editor engine behind `EditorEngine`; keep **Puck** in production until dual-engine parity. Do not import Vvveb CMS. |

## Update process

When adding editor-related packages:

1. Record package name, version, license.
2. Confirm compatibility with Aevion’s distribution model.
3. Update this file in the same PR.
