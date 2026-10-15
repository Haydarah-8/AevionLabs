# Third-party projects (Vvveb ecosystem)

> Not legal advice. Record of incorporation decisions for Aevion Website Factory.

## Summary decision

| Project                                                                | License        | Incorporated into Aevion?                                                 |
| ---------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------- |
| [VvvebJs](https://github.com/givanz/VvvebJs)                           | **Apache-2.0** | **Yes** — editor engine via npm `vvvebjs`, assets via `/vvvebjs/*`        |
| [@vvvebjs/react](https://github.com/VvvebJs/react)                     | Apache-2.0     | Reference only; Next uses custom `VvvebEngine`                            |
| [Vvveb Admin Template](https://github.com/givanz/vvveb-admin-template) | **Apache-2.0** | **Patterns only** — no wholesale HTML/CSS copy; Aevion design system wins |
| [Vvveb CMS](https://github.com/givanz/Vvveb)                           | **AGPL-3.0**   | **No code** — conceptual inspiration only                                 |

## VvvebJs (Apache-2.0)

| Field         | Value                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| Repository    | https://github.com/givanz/VvvebJs                                                                        |
| Package       | `vvvebjs@2.0.9`                                                                                          |
| Files used    | Served at runtime from `node_modules/vvvebjs` (editor.html, libs/, css/, js/, …)                         |
| Aevion code   | `src/lib/editor/vvveb-engine.ts`, Studio shell, `/vvvebjs/[...path]` route                               |
| Modifications | Adapter loads scripts with absolute `/vvvebjs/` paths; Aevion chrome around editor; no PHP save backends |
| Attribution   | `docs/legal/VVVEBJS-APACHE-2.0.txt`                                                                      |
| Distribution  | Retain Apache-2.0 notices when redistributing VvvebJs files                                              |

## Vvveb Admin Template (Apache-2.0)

| Field        | Value                                                                                |
| ------------ | ------------------------------------------------------------------------------------ |
| Repository   | https://github.com/givanz/vvveb-admin-template                                       |
| Use          | UX reference (site switcher, media UI, tables, settings IA)                          |
| Files copied | **None** as of this date                                                             |
| Rule         | Re-implement useful patterns in Aevion Tailwind/dark studio UI; keep Aevion branding |

If specific Apache-licensed template files are later vendored, list each path here and preserve NOTICE/LICENSE.

## Vvveb CMS (AGPL-3.0) — HARD STOP

| Field         | Value                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository    | https://github.com/givanz/Vvveb                                                                                                                                                                               |
| License       | GNU Affero General Public License v3.0                                                                                                                                                                        |
| Use in Aevion | **Inspiration only** (workflows: sites, media, revisions, publish)                                                                                                                                            |
| Files copied  | **None**                                                                                                                                                                                                      |
| Rationale     | AGPL network-copyleft is incompatible with Aevion’s private application model without an explicit legal strategy (e.g. separate AGPL service, commercial license from author, or counsel-approved exception). |

### Forbidden without legal review

- Copying PHP/JS application code from `givanz/Vvveb` into this repository
- Linking Aevion as a derivative that must be AGPL’d
- Shipping a “Vvveb CMS backend” alongside Aevion as a dual stack

### Allowed

- Reading public documentation and demos
- Implementing equivalent features as **original Aevion code** against Aevion’s schema
- Using Apache-2.0 VvvebJs / admin-template artifacts under their terms

## Themes / plugins under Vvveb brand

Separate theme/plugin repos may use MIT/Apache/etc. Treat each as its own license review before copying. Default: **do not vendor**.

## Related docs

- [open-source-licenses.md](./open-source-licenses.md)
- [../architecture/vvveb-integration.md](../architecture/vvveb-integration.md)

## Change log

| Date       | Decision                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 2026-09-19 | VvvebJs Apache-2.0 integrated; CMS AGPL excluded; Admin Template inspiration-only                |
| 2026-09-19 | Cloned all three repos under `integrations/vvveb/` for inspection; see `third-party-licenses.md` |
