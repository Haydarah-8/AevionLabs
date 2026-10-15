# Vvveb integration — HISTORICAL

> **Retired 2026-09-19.** Vvveb is no longer part of the Aevion application.
>
> Canonical status: [`current-state.md`](./current-state.md)  
> Migration plan: [`grapesjs-migration-plan.md`](./grapesjs-migration-plan.md)  
> Editor: [`editor.md`](./editor.md)

## What was removed

- npm `vvvebjs` / `@vvvebjs/react`
- `/vvvebjs/*` asset route
- Mega Studio visual/split modes
- `/cms` Docker CMS proxy and `/admin/cms` iframe
- Lab portal routes

## What remains (intentional)

- Legacy HTML page JSON with `engine: "vvveb"` may still exist in `website_pages` — readable via `isLegacyHtmlDocument` for public render only
- External sibling lab (`Desktop/aevion-vvveb-lab`) is unrelated to Aevion product shipping
- Docs under `docs/vvveb*` and `docs/legal/VVVEBJS-*` kept for license history

## Replacement direction

Aevion Studio → `EditorEngine` → **GrapesJS** (Puck remains production until Grapes parity).
