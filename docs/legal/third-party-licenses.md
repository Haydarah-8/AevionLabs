# Third-party licenses — Vvveb ecosystem

> Not legal advice. Record of incorporation decisions for Aevion.

## Summary

| Project | License | Commit inspected | Incorporated? |
|---------|---------|------------------|---------------|
| [VvvebJs](https://github.com/givanz/VvvebJs) | Apache-2.0 | `1acbab7ebfe3e7b004f1f18c039d26550fc04bd8` | **Yes** — runtime via npm `vvvebjs@2.0.9` + `/vvvebjs/*` |
| [Vvveb Admin Template](https://github.com/givanz/vvveb-admin-template) | Apache-2.0 | `4cdf289f5555414fac04186bab3673c7fee9dd85` | **Patterns only** — no wholesale HTML/CSS vendored |
| [Vvveb CMS](https://github.com/givanz/Vvveb) | **AGPL-3.0** | `5adb8cde58b74bb95ee1bb07505efb2ff76cdfe1` | **No code** — conceptual inspiration only |

Local clones for inspection: `integrations/vvveb/` (gitignored). Re-clone script: `integrations/vvveb/clone-vvveb-ecosystem.ps1`.

---

## VvvebJs (Apache-2.0)

| Field | Value |
|-------|--------|
| Repository | https://github.com/givanz/VvvebJs |
| npm | `vvvebjs` |
| Files used at runtime | Served from `node_modules/vvvebjs` (editor.html, libs/builder/*, css/, media/, …) |
| Aevion adapters | `src/lib/editor/vvveb-engine.ts`, Studio shell, `src/app/vvvebjs/[...path]/route.ts` |
| Modifications | Absolute `/vvvebjs/` asset paths; Aevion chrome; persistence via Aevion APIs (no PHP save) |
| Attribution | `docs/legal/VVVEBJS-APACHE-2.0.txt` |
| Distribution | Retain Apache notices when redistributing VvvebJs files |

Bundled icon packs inside VvvebJs carry their own licenses under `resources/svg/icons/*/LICENSE` — retain if redistributing those assets.

---

## Vvveb Admin Template (Apache-2.0)

| Field | Value |
|-------|--------|
| Repository | https://github.com/givanz/vvveb-admin-template |
| Use | UX/IA reference (sidebar domains, media grids, site settings) |
| Files copied into Aevion | **None** |
| Rule | Re-implement useful patterns in Aevion design system |

If specific template files are later vendored, list each path here with NOTICE retention.

---

## Vvveb CMS (AGPL-3.0) — HARD STOP

| Field | Value |
|-------|--------|
| Repository | https://github.com/givanz/Vvveb |
| License | GNU Affero General Public License v3.0 |
| Files copied | **None** |
| Rationale | AGPL network-copyleft is incompatible with Aevion’s private application model without an explicit legal strategy |

### Forbidden without legal review

- Copying PHP/JS application code from `givanz/Vvveb` into this repository  
- Shipping a parallel Vvveb CMS backend  
- Treating CMS clone as a production dependency  

### Allowed

- Local clone for architecture study  
- Implementing equivalent features as **original Aevion code** against Aevion’s schema  
- Using Apache-2.0 VvvebJs under its terms  

---

## Source-control decision

| Approach | Decision |
|----------|----------|
| Commit full clones into Aevion git | **No** — ~110MB+, nested `.git`, unmaintainable |
| Git submodules | Optional later; not required for runtime |
| npm package for editor | **Yes** — maintainable updates |
| Gitignored local clones + clone script | **Yes** — developer reference |
| Selective vendor of Admin HTML | Only if Apache NOTICE preserved; prefer Aevion-native React |

---

## Change log

| Date | Decision |
|------|----------|
| 2026-09-19 | Cloned all three for inspection; CMS AGPL excluded; Admin patterns-only; VvvebJs via npm |
| 2026-09-19 | Added this file + `docs/vvveb-analysis.md` |

See also: [third-party.md](./third-party.md), [open-source-licenses.md](./open-source-licenses.md).
