# Vvveb ecosystem — local reference clones

These directories are **development/reference sources** for inspecting the full Vvveb ecosystem.
They are **not** runtime dependencies of the Aevion Next.js app.

## Layout

```text
integrations/vvveb/
  README.md                 ← this file
  clone-vvveb-ecosystem.ps1 ← re-fetch script
  vvvebjs/                  ← givanz/VvvebJs (Apache-2.0) — gitignored after clone
  vvveb-admin/              ← givanz/vvveb-admin-template (Apache-2.0) — gitignored
  vvveb-cms/                ← givanz/Vvveb (AGPL-3.0) — gitignored; inspect only
```

## Runtime vs reference

| Source | Runtime in Aevion? |
|--------|--------------------|
| npm `vvvebjs` + `/vvvebjs/*` route | **Yes** — visual editor engine |
| `integrations/vvveb/vvvebjs` clone | Reference / deeper inspection |
| Admin template clone | **Patterns only** — re-implemented in Aevion UI |
| CMS clone | **Inspiration only** — **no code copied** (AGPL-3.0) |

## Clone / refresh

```powershell
pwsh ./integrations/vvveb/clone-vvveb-ecosystem.ps1
```

Pinned commits are recorded in `docs/vvveb-analysis.md` and `docs/legal/third-party-licenses.md`.

## Why not commit the full trees?

~110MB+ of third-party source with nested `.git` histories would bloat Aevion’s repo.
Clones stay local + gitignored; documentation and the npm package carry what production needs.
