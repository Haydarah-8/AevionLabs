# Vvveb ecosystem analysis → Aevion

> Inspected: 2026-09-19  
> Clones: `integrations/vvveb/{vvvebjs,vvveb-admin,vvveb-cms}` (local reference; gitignored)  
> Principle: **Aevion is the product. Vvveb supplies capabilities — not a second app.**

## Ecosystem relationship

```text
VvvebJs                          Vvveb Admin Template              Vvveb CMS
────────                         ────────────────────              ─────────
Visual editor                    Bootstrap 5 admin HTML            Full PHP application
(builder.js, components,         (sidebar, tables, media,          (sites, posts, products,
 sections, undo, media)          themes UI, plugins UI)            revisions, plugins, DB)

         │                                │                              │
         └──────────────┬─────────────────┴──────────────┬───────────────┘
                        │                                │
                   Used together in commercial Vvveb demos
                        │
                        ▼
                 AEVION (this repo)
                        │
        ┌───────────────┼────────────────┐
        │               │                │
   Dashboard         CMS              Studio
   (Aevion UI,       (Aevion-native,  (VvvebJs via
    IA inspired)      concepts only)   EditorEngine)
                        │
                   AEVION CORE
```

They are **three separate repositories**, not one monorepo. CMS vendors the admin theme and embeds VvvebJs for page editing; Admin Template is the static Bootstrap skin; VvvebJs is the standalone JS builder.

---

## Pinned commits (shallow clone, 2026-09-19)

| Project | Repo | Commit | License |
|---------|------|--------|---------|
| VvvebJs | https://github.com/givanz/VvvebJs | `1acbab7ebfe3e7b004f1f18c039d26550fc04bd8` | **Apache-2.0** |
| Admin Template | https://github.com/givanz/vvveb-admin-template | `4cdf289f5555414fac04186bab3673c7fee9dd85` | **Apache-2.0** |
| CMS | https://github.com/givanz/Vvveb | `5adb8cde58b74bb95ee1bb07505efb2ff76cdfe1` | **AGPL-3.0** |

Refresh: `pwsh ./integrations/vvveb/clone-vvveb-ecosystem.ps1`

---

## 1. VvvebJs — visual editor

### Architecture (from clone)

| Area | Location / API |
|------|----------------|
| Core builder | `libs/builder/builder.js` — `Vvveb.Builder`, `Vvveb.Components`, `Vvveb.Sections`, `Vvveb.StyleManager`, `Vvveb.Gui`, `Vvveb.FileManager` |
| Undo | `libs/builder/undo.js` — `Vvveb.Undo` |
| Inputs / inspector | `libs/builder/inputs.js` |
| HTML / elements / Bootstrap 5 | `components-html.js`, `components-elements.js`, `components-bootstrap5.js`, `components-widgets.js` |
| Sections / blocks | `section.js`, `sections-bootstrap4.js`, `blocks-bootstrap4.js` |
| Media gallery | `libs/media/media.js` + `plugin-media.js` |
| Code editor | CodeMirror plugins |
| Export ZIP | `plugin-jszip.js` |
| Shell UI | `editor.html` (heavy Bootstrap chrome) |
| Demo save backends | `save.php`, `upload.php`, `scan.php` — **not used by Aevion** |

### How storage works in stock VvvebJs

Editor holds HTML in an iframe (`Builder.loadHtml` / `getHtml`). Persist hooks fire `Vvveb.Builder.save` and optional PHP endpoints. **No first-class DB model** — the CMS supplies that.

### Aevion mapping

| VvvebJs | Aevion |
|---------|--------|
| Canvas / DnD / layers / styles | Aevion Studio → `VvvebEngine` → npm `vvvebjs` via `/vvvebjs/*` |
| Page HTML | `website_pages.draft_data` as `VvvebPageDocument` |
| File manager pages | Aevion pages list in Studio chrome |
| Media modal | Must call Aevion assets (not Openverse-only) |
| Theme typography/colours | `website_projects.theme` (`ThemeTokens`) |
| ZIP export plugin | Aevion `exportWebsiteZip` |

**Incorporate:** Apache-2.0 editor runtime (already via npm).  
**Do not:** run `save.php` / separate VvvebJs server.

---

## 2. Vvveb Admin Template — dashboard patterns

### What it is

Static Bootstrap 5 admin HTML + SCSS + gulp includes. Default skin for Vvveb CMS demos.

### Notable IA (from `src/_includes/sidebar.html`)

- Dashboard  
- Edit website (opens builder)  
- Posts / Pages  
- Media library  
- Users / roles  
- Messages  
- Ecommerce / Sales / Products  
- Plugins / Themes  
- Fields  
- Settings / Sites  

Also: dark/light, media grid, product/post tables, theme/plugin cards, cache tools UI.

### Aevion mapping

| Admin Template concept | Aevion |
|------------------------|--------|
| Sidebar IA | Evolve `AdminShell` / future secondary nav — **Aevion visual language** |
| Site switcher | `WebsiteSwitcher` |
| Media library screens | Extend gallery + project assets |
| Posts tables | `/admin/blog` + future factory content |
| Themes/plugins screens | Templates + future `AevionExtension` UI |
| Bootstrap skin wholesale | **Do not ship** — redesign in Aevion Tailwind |

**Incorporate:** UX patterns only (Apache allows copy, but product rule is Aevion-native UI).  
**Do not:** serve `vvveb-admin` as a second admin app.

---

## 3. Vvveb CMS — full application (AGPL)

### What it is

PHP CMS (MySQL/MariaDB/SQLite/Postgres), multi-site, ecommerce, GraphQL/REST, plugins, themes, revisions, page builder integration.

### Controllers (admin)

`content`, `editor`, `media`, `user`, `theme`, `plugin`, `product`, `order`, `settings`, `field`, `localization`, `tools`

### System cores

`system/sites.php` (multi-site), cache, media, session, events, cart/payment/shipping, DB layer, VTPL templates.

### Revisions

`admin/controller/content/revisions.php`, `editor/revisions.php`, SQL schemas `post_content_revision`, `product_content_revision`.

### Licensing hard stop

**AGPL-3.0** network copyleft. Copying CMS PHP/JS application code into proprietary Aevion would create Affero obligations for network users unless counsel/commercial license allows otherwise.

| Allowed | Forbidden (without legal clearance) |
|---------|-------------------------------------|
| Read architecture for inspiration | Vendor CMS source into Aevion runtime |
| Re-implement features as original Aevion code | Dual-stack “Aevion + Vvveb CMS” in production |
| Document capability gaps | Link proprietary app as AGPL derivative |

---

## 4. Capability map (ecosystem → Aevion)

| Capability | Vvveb source | Aevion status | Action |
|------------|--------------|---------------|--------|
| Visual builder | Js | Studio + `VvvebEngine` | Deepen |
| Admin dashboard | Admin | `/admin` | Evolve IA; keep Aevion look |
| Sites / multi-site | CMS | `website_projects` | Reuse |
| Pages | CMS | `website_pages` | Reuse |
| Posts / blog | CMS | `/admin/blog` | Connect factory sites later if needed |
| Media | CMS + Admin | uploads + `business_media` | Usage index next |
| Themes | CMS + Admin | `ThemeTokens` + templates | Expand |
| Plugins | CMS | Future `AevionExtension` | Native design |
| Revisions | CMS | `website_versions` | Polish UI |
| Publishing | CMS | draft → preview → live | Reuse |
| Users / roles | CMS | Supabase + admin | Map concepts |
| Ecommerce | CMS | Not required now | Schema note only |
| GraphQL/REST | CMS | `/api/v1` + MCP | Aevion services |
| Scraper / factory | — | Aevion intelligence | Unique to Aevion |
| AI / MCP | — | Aevion | Commands layer |

---

## 5. Overlap with existing Aevion (do not duplicate)

Already present: auth, websites, pages, businesses/services/team/reviews/media, templates, theme tokens, versions, deployments, domains, scraper, generator, AI (Puck), API, MCP, audit, agency blog.

**One database. One auth. One website model.** Editor persistence already targets Aevion APIs.

---

## 6. Integration architecture

```text
                    AEVION
                       │
       ┌───────────────┼────────────────┐
       │               │                │
   Dashboard        CMS              Studio
   (AdminShell)  (Aevion models)  (VvvebJs engine)
       │               │                │
       └───────────────┼────────────────┘
                       │
              aevionCommands
                       │
         website-factory/application/*
                       │
              Store / Supabase
```

Source-control strategy:

1. **Runtime:** npm `vvvebjs` (Apache-2.0)  
2. **Reference clones:** `integrations/vvveb/*` gitignored  
3. **Admin:** patterns → Aevion React/Tailwind  
4. **CMS:** zero source import; Aevion-native features  

---

## 7. Customisation mandate

User-facing product must say **Aevion**, not Vvveb:

- Studio chrome already soft-branded  
- Hide Vvveb logos/links where the shell is under our control  
- Component library: build Aevion sections compatible with the canvas (Bootstrap-compatible HTML), registered via Aevion registry — not leave stock demos as the product identity  
- Dashboard: never mount Admin Template HTML as the live admin  

---

## 8. Implementation status vs this download request

| Step | Status |
|------|--------|
| 1 Download/clone all three | ✅ |
| 2 Inspect | ✅ (this doc) |
| 3 License audit | ✅ |
| 4 Capability map | ✅ |
| 5–6 Aevion audit / overlap | ✅ (see also `docs/architecture/vvveb-integration.md`) |
| 7 Integration architecture | ✅ |
| 8 Deepen Studio | In progress |
| 9 Adapt admin IA | Partial (`AdminShell`, switcher) |
| 10 Aevion-native CMS gaps | Incremental (no AGPL code) |
| 11–20 Wire factory/AI/API/MCP/deploy | Partial via `aevionCommands` |
| 21 Full UI customisation | Ongoing |
| 22–25 Dedup / security / perf / regression | Ongoing |

---

## Related docs

- [architecture/vvveb-integration.md](./architecture/vvveb-integration.md)  
- [legal/third-party-licenses.md](./legal/third-party-licenses.md)  
- [legal/third-party.md](./legal/third-party.md)  
- [integrations/vvveb/README.md](../integrations/vvveb/README.md)  
