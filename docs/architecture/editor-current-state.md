# Aevion Studio — Editor Current State (Phase 1 Audit)

> **Status:** Audit only — no greenfield rebuild.  
> **Date:** 2026-09-19  
> **Mandate:** Puck is the permanent visual engine. Aevion owns the model. Do **not** introduce Vvveb, GrapesJS, or Webstudio. Do **not** replace Next.js / React / Supabase.

Related docs (may be partially stale on Grapes/Vvveb “next” language):

- [`current-state.md`](./current-state.md) — full platform audit
- [`website-data-model.md`](./website-data-model.md) — factory schema
- [`website-factory.md`](./website-factory.md) — pipeline
- [`editor.md`](./editor.md) — older Studio notes (superseded on engine roadmap by this file)
- [`template-system.md`](./template-system.md) · [`deployment.md`](./deployment.md)

---

## 0. Verdict in one paragraph

Aevion already has a working **Website Factory + Puck Studio** under `/admin/websites/[id]/editor`. Persistence, publish, templates, scrape import, theme tokens, ZIP export, Vercel deploy (when configured), domains, `/api/v1`, and MCP all exist and must be **extended**. The gap vs a Webflow-class product is not “missing a page builder package” — it is **missing shared platform primitives** (canonical component registry, responsive values, design variables, real CMS bindings, interactions, orgs/permissions, per-site analytics) and an **editor abstraction that production actually uses**. Production still talks to `@puckeditor/core` directly inside `AevionEditor.tsx`; `src/lib/editor/PuckEngine` is a stub.

---

## 1. Stack (verified from package.json / code)

| Layer         | Value                                                              |
| ------------- | ------------------------------------------------------------------ |
| App           | `aevion-labs` 0.1.0                                                |
| Framework     | Next.js **16.2.0** (App Router) · React **19.2.4** · TypeScript    |
| Visual editor | **`@puckeditor/core` 0.23.0**                                      |
| Auth / DB     | Supabase (`@supabase/ssr`, `@supabase/supabase-js`)                |
| Dev port      | **3005**                                                           |
| Persistence   | Supabase Postgres **or** JSON fallback `data/website-factory.json` |

**Engine policy (binding):**

| Engine    | Status                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------- |
| **Puck**  | Production — keep forever as Studio foundation                                                        |
| Vvveb     | Retired as active editor (`20260919_retire_vvveb_editor.sql`); legacy HTML envelopes still _readable_ |
| GrapesJS  | Must **not** be introduced; older docs/types that mention it are debt to neutralize                   |
| Webstudio | Out of scope                                                                                          |

---

## 2. Source-of-truth architecture (what exists)

```text
Supabase / JSON store
  → businesses + website_projects + website_pages
  → draft_data / preview_data / published_data (jsonb)
  → website_versions / deployments / domains
        ↓
Application services (src/features/website-factory/application/*)
        ↓
Admin APIs + /api/v1 + MCP
        ↓
AevionEditor (Puck UI)  ← editing interface only
        ↓
FactoryDocument / SiteRender (same Puck config for preview + live)
```

**Correct direction already in place:** page JSON lives on Aevion pages; Puck is not a separate database.

**Incorrect coupling to fix later:** Studio chrome imports Puck internals and config directly; AI/MCP component APIs know Puck node shapes (`application/components.ts`) without going through a full `EditorEngine` adapter.

---

## 3. Routes & surfaces

| Surface                  | Route                                     | Role                                                 |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------- |
| Studio (today)           | `/admin/websites/[id]/editor`             | Operator Studio — `AevionEditor`                     |
| Desired Studio           | `/studio/[websiteId]/[pageId]`            | **Not built** — migrate later without breaking admin |
| Project hub              | `/admin/websites/[id]`                    | Overview / nav                                       |
| Content                  | `/admin/websites/[id]/content`            | Business content                                     |
| Scrape CMS UI            | `/admin/websites/[id]/cms`                | Import apply (not SaaS CMS)                          |
| Preview                  | `/preview/...`, `/p`, `/s`, factory hosts | Public render                                        |
| Agency site              | `(site)`                                  | Marketing                                            |
| Customer dashboard       | —                                         | **Missing**                                          |
| Platform admin vs tenant | Collapsed into `(admin)`                  | **Missing split**                                    |

---

## 4. Puck configuration & components

### Config entry

- `src/features/website-factory/puck/config.tsx` → `factoryConfig`
- Categories today: **chrome · structure · basic · sections · advanced** (+ advanced from `advanced-components.ts`)
- Public render: `puck/SiteRender.tsx` + `public/FactoryDocument.tsx`
- Style object field: `puck/style-fields.ts` / `puck/styles.ts` / `withBoxStyles` (`puck/wrap.tsx`)
- Custom fields: `puck/custom-fields.tsx` (colour, spacing, …)
- Inline edit helpers: `puck/editable.tsx` (`Focusable`, `contentEditable` on text/textarea/richtext)
- Docs metadata (partial): `puck/meta.ts` → `COMPONENT_META`

### Catalog size (approx.)

| Source                                    | Count                                          |
| ----------------------------------------- | ---------------------------------------------- |
| Core components in `config.tsx`           | ~56                                            |
| Advanced components                       | ~68                                            |
| Render functions in `blocks.tsx`          | ~56                                            |
| Render functions in `blocks-advanced.tsx` | ~68                                            |
| Thin registry stub                        | 5 types in `src/components/aevion/registry.ts` |

**Gap:** No single **canonical Aevion Component Registry** driving Puck + templates + AI + CMS + docs + MCP. Production catalog = Puck config. Stub registry uses lowercase ids (`hero`) and still lists `engines: ["puck","grapesjs"]` — outdated.

### Component categories vs vision

| Vision category      | Today                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| Layout               | Partial (Section, Container, Flex, Grid, Box, columns, Spacer, Divider) |
| Basic                | Partial (Heading, TextBlock, ImageBlock, ButtonBlock, Video, …)         |
| Sections / Marketing | Strong (Hero variants, Services, FAQ, CTA, Pricing, …)                  |
| Navigation           | Partial (Navbar, MobileNavbar, breadcrumbs-ish)                         |
| Forms                | Partial (ContactForm, QuoteForm, Newsletter, …) — not a form builder    |
| Commerce             | Thin / missing                                                          |
| CMS dynamic          | Partial (CollectionList + `_binds`; not full CMS product)               |
| Industry-specific    | Via **templates**, not component category                               |

---

## 5. Aevion Studio UI (what exists)

**Shell:** `src/features/website-factory/editor/AevionEditor.tsx` (~3k lines)

| Region          | Implementation                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Top bar         | Page select, save chip, devices, undo/redo, zoom, focus, publish                                                                                 |
| Left rail       | Pages, site, add, **tools (100)**, layers, assets, import, CMS, AI, API, deploy                                                                  |
| Canvas          | `Puck.Preview` + iframe + `CanvasHeightSync` + device width (390/768/1280/1440)                                                                  |
| Right panel     | Tabs: content / layout / typography / appearance / responsive / advanced / theme / seo / audit / history → `ContextualInspector` + `Puck.Fields` |
| Bottom bar      | `StudioBottomBar.tsx`                                                                                                                            |
| Command palette | `StudioCommandPalette.tsx`                                                                                                                       |
| Hover toolbar   | `StudioActionBar.tsx` (Puck `actionBar` override)                                                                                                |
| Overlay         | `StudioComponentOverlay.tsx`                                                                                                                     |
| Tools catalog   | `studio-tools.ts` (~100 Vvveb-_inspired_ tools — **not** Vvveb itself)                                                                           |

**Autosave:** debounced `queueSave` → page draft API; states saving / saved / failed.

**Permissions (Puck):** global `drag | duplicate | delete | edit | insert` enabled on `<Puck>`.

**Shortcuts (partial):** undo/redo, save, preview, viewport 1/2/3, focus `F`, Escape — not full Webflow set; not documented end-to-end.

---

## 6. Editor abstraction (`src/lib/editor/`)

| File                                 | Role                                           | Production use          |
| ------------------------------------ | ---------------------------------------------- | ----------------------- |
| `editor-types.ts`                    | `EditorEngine` interface, `AevionPageDocument` | Types only              |
| `puck-engine.ts`                     | Stub `PuckEngine` class                        | **Throws** — not wired  |
| `editor-serializer.ts`               | Puck ↔ Aevion document; legacy HTML readable   | Used in tests / tooling |
| `editor-importer.ts` / `exporter.ts` | Import/export helpers                          | Partial                 |
| `editor-events.ts`                   | Event names                                    | Thin                    |
| `editor-engine.ts`                   | Barrel                                         | —                       |

**Debt:** `EditorEngineId = "puck" | "grapesjs"` and Grapes document branches in serializer — neutralize to **Puck-only** (+ legacy HTML read path). Do **not** implement Grapes.

**Phase 2 target:** Make `PuckEngine` wrap real Studio operations so AI/API/MCP call the adapter, while UI can still use compositional Puck APIs.

---

## 7. Data model (factory)

Migrations: `20260918_website_factory.sql`, `20260918_factory_platform.sql`, `20260918_factory_scrape_cms.sql`, `20260919_editor_engine.sql`, `20260919_retire_vvveb_editor.sql`.

| Entity              | Table / type             | Notes                                |
| ------------------- | ------------------------ | ------------------------------------ |
| Business            | `businesses` + children  | Generation source                    |
| Template            | `website_templates`      | `definition_key` → code              |
| Website             | `website_projects`       | theme, seo, domains, `editor_engine` |
| Page                | `website_pages`          | draft / preview / published jsonb    |
| Version             | `website_versions`       | publish snapshots                    |
| Deploy / Domain     | dedicated tables         | Real providers when configured       |
| Scrape import       | `factory_scrape_imports` | Durable imports                      |
| API keys / webhooks | factory\_\*              | Developer platform                   |

**Page document types** (`types.ts`):

- `PuckData` — active
- `LegacyHtmlPageDocument` — read legacy only
- `GrapesPageDocument` — **debt**; should not be written by new code

RLS: factory tables service_role only; public HTML via Next server reads.

---

## 8. Templates, theme, assets

| Area                    | Status                                                                  |
| ----------------------- | ----------------------------------------------------------------------- |
| Industry templates      | Code + DB seed (~many definition keys under `templates/`)               |
| Theme tokens            | `ThemeTokens` on project; Studio theme tab; CSS vars in canvas          |
| Design variables system | Done — `theme.variables` + Theme tab (Phase 7)                          |
| Style presets           | Partial chips in inspector + tools catalog                              |
| Media library           | Project assets API + Studio assets tab — not full folders/tags/crop CMS |

---

## 9. CMS (three meanings — keep them distinct)

| Name               | What it is                     | Product path                                                       |
| ------------------ | ------------------------------ | ------------------------------------------------------------------ |
| Agency CMS         | `src/lib/cms/*` for aevion.com | Keep; not factory SaaS CMS                                         |
| Factory scrape CMS | Import apply UI                | Keep as **Import**                                                 |
| Desired SaaS CMS   | Collections, entries, bindings | **Phase 9** — `siteConfig.collections` + CollectionList + `_binds` |

Do **not** create a competing CMS package; extend Aevion models.

---

## 10. AI, scrape, API, MCP, publish, analytics

| Capability                 | Status                | Path                                            |
| -------------------------- | --------------------- | ----------------------------------------------- |
| Scrape → structured import | Real                  | `intelligence/*`, SSRF guards                   |
| AI Studio rail             | Real                  | Plan → validate → confirm destructive → apply   |
| Structured AI ops          | Done                  | `ai/ops.ts` allowlist + 409 confirm gate        |
| `/api/v1`                  | Real                  | websites, pages, components, publish, deploy, … |
| MCP                        | Real                  | same application services                       |
| Publish + versions         | Real                  | draft → published + restore                     |
| ZIP export                 | Real                  | Puck-oriented                                   |
| Vercel deploy              | Real when token set   | honest idle otherwise                           |
| Domains                    | DNS verify real       |                                                 |
| GitHub export              | When OAuth configured |                                                 |
| Per-site analytics         | **Missing**           | Only agency `visitors`                          |
| Orgs / roles               | **Missing**           | Admin-only today                                |

---

## 11. Vision coverage matrix (sections 1–76 → today)

Legend: **Done** · **Partial** · **Missing** · **N/A (policy)**

| Theme                          | Spec § | Status            | Existing anchor                             |
| ------------------------------ | ------ | ----------------- | ------------------------------------------- |
| Puck foundation                | 1, 76  | Done              | `@puckeditor/core`                          |
| Aevion SoT                     | 4      | Done              | pages jsonb + services                      |
| Editor abstraction             | 5      | Partial           | `lib/editor` stub                           |
| Studio chrome                  | 6      | Partial           | `AevionEditor` (admin route)                |
| Component registry             | 7–10   | Partial           | Puck config + thin stub                     |
| Dynamic fields                 | 11     | Missing           | —                                           |
| Responsive system              | 12–14  | Done              | ResponsiveValue + inherit/reset UI          |
| Layout / spacing UI            | 15–17  | Done              | Visual LayoutControls over StyleBox         |
| Simple/Advanced modes          | 16     | Partial           | Layout “All fields”; other tabs still raw   |
| Tokens / variables             | 18–19  | Done              | ThemeTokens + custom `theme.variables`      |
| Theme / presets                | 20–21  | Done/Partial      | Theme tab + design variables bridge         |
| Canvas ops                     | 22–23  | Partial           | DnD, toolbar, some shortcuts                |
| Layers                         | 24     | Done              | StudioLayersPanel + multi-select + persist  |
| Pages                          | 25     | Done              | Multi-page + settings, 404, redirects       |
| CMS + bindings                 | 26–29  | Partial           | Collections + CollectionList + field binds  |
| Visibility / interactions      | 30–32  | Partial           | Hide/lock + hover/click/appear presets      |
| UI primitives                  | 33–34  | Partial           | Accordion/tabs blocks, not system           |
| Media                          | 35     | Partial           | Assets API                                  |
| SEO / a11y / perf audits       | 36–39  | Partial           | Health/SEO tabs; not full audit suite       |
| Autosave / history / versions  | 40–42  | Done              | Autosave + named publish timeline + restore |
| Preview / publish              | 43–44  | Done/Partial      | Same render path; validation light          |
| Templates / factory / AI       | 45–48  | Partial           | Strong factory; AI safety incomplete        |
| Collab / permissions           | 49–50  | Missing           | Admin only                                  |
| Customer dashboard             | 51     | Missing           | —                                           |
| Admin panel                    | 52     | Partial           | Operator admin exists                       |
| Analytics                      | 53–55  | Missing (factory) | Agency visitors only                        |
| API / MCP / export             | 56–58  | Done/Partial      | Extend, don’t replace                       |
| GitHub / deploy / domains      | 59–61  | Partial           | Real when configured                        |
| Forms product                  | 62     | Partial           | Blocks only                                 |
| Search / activity              | 63–64  | Partial           | Audit logs exist                            |
| Docs / tests / perf / security | 65–71  | Partial           | Architecture docs + Vitest; expand          |
| Reusable primitives            | 73     | Done              | Registry + ResponsiveValue + DesignVariable |

---

## 12. What to preserve (do not rebuild)

1. `factoryConfig` + `blocks*.tsx` + `SiteRender` / `FactoryDocument`
2. `AevionEditor` chrome, autosave, inspector, tools, action bar
3. Application services + `/api/v1` + MCP
4. Website / page / version / deploy / domain model
5. Template seeds + generate/scrape/apply pipeline
6. `lib/editor` **interface** (implement Puck; drop Grapes language)
7. Dual persistence (Supabase + local JSON) for dev
8. Admin auth until orgs ship

---

## 13. What to neutralize (debt)

- Docs and types that say “GrapesJS is next” or “retire Puck”
- `GrapesPageDocument` write paths; `engines: ["grapesjs"]` in stub registry
- Remaining Vvveb packages/routes if any still present (see `current-state.md` §11)
- Overloading the label “CMS” in UI

---

## 14. Implementation plan (aligned to mandate §72)

Execute **incrementally**. Each phase must leave Studio publishable.

| Phase  | Focus                    | Exit criteria                                                             |
| ------ | ------------------------ | ------------------------------------------------------------------------- |
| **1**  | This audit               | `editor-current-state.md` ✅                                              |
| **2**  | Editor abstraction       | `PuckEngine` used by at least save/load/select APIs; Studio still Puck UI |
| **3**  | Canonical registry       | One registry generates Puck categories + meta for AI/MCP/docs             |
| **4**  | Canvas / layers          | Multi-select foundation, layers rename/lock/hide persisted                |
| **5**  | ResponsiveValue          | Desktop/tablet/mobile overrides with inherit/reset UI                     |
| **6**  | Layout system            | Simple visual controls over existing style object                         |
| **7**  | Design variables         | Project variables + theme bridge                                          |
| **8**  | Slots / variants / lock  | Formalize Puck slots + instance flags                                     |
| **9**  | CMS bindings             | Collections + Collection List + field binds                               |
| **10** | Interactions             | Preset hover/click animations (data-driven)                               |
| **11** | Pages / templates        | Page settings, 404, redirects; industry templates stay                    |
| **12** | History UX               | Timeline + named versions on existing version table                       |
| **13** | AI ops                   | Planned structured ops + confirm destructive                              |
| **14** | Audits                   | SEO / a11y / perf panels with real checks only                            |
| **15** | Customer dashboard       | New route group; admin remains platform                                   |
| **16** | Analytics                | Per-project events (no fake realtime)                                     |
| **17** | Admin polish             | Split platform vs tenant language                                         |
| **18** | API/MCP                  | Registry-driven schemas                                                   |
| **19** | Domains/deploy/export    | Extend providers                                                          |
| **20** | Docs/tests/security/perf | Hardening                                                                 |

**Near-term (next coding sessions after this audit):** Phase 14 — audits (SEO / a11y / perf panels with real checks only).

---

## 15. Quality bar (enforcement)

- No decorative buttons without handlers
- No fake analytics / deploy success
- No second database or second CMS product
- No second visual builder
- Features must persist to Aevion pages/projects and survive publish
- Prefer extending `style-fields`, registry, and application services over parallel engines

---

## 16. Open questions (resolve during Phase 2–3)

1. Keep Studio under `/admin/websites/.../editor` until customer dashboard, or introduce `/studio/...` alias early?
2. Registry ownership: ✅ Phase 3 reverse-syncs from `factoryConfig`; later may invert to generate Puck config.
3. Responsive values: ✅ `props.styles` = desktop/base; `props.styles.responsive.{tablet,mobile}` = overrides.
4. When to drop `GrapesPageDocument` type entirely (after confirming zero rows)?

---

## 17. Phase status

| Phase                    | Status                                                                           |
| ------------------------ | -------------------------------------------------------------------------------- |
| **1** Audit              | ✅ `editor-current-state.md`                                                     |
| **2** Editor abstraction | ✅ Headless `PuckEngine`; Grapes language neutralized; component APIs use engine |
| **3** Canonical registry | ✅ Derived from `factoryConfig` + meta; API/MCP/AI/docs consumers wired          |
| **4** Canvas / layers    | ✅ Studio layers panel; `_label` / `_locked` / `_hidden` persisted; multi-select |
| **5** ResponsiveValue    | ✅ `styles.responsive.{tablet,mobile}`; inherit/reset; media-query StyleShell    |
| **6** Layout system      | ✅ Visual LayoutControls (display/flex/grid/spacing/size) over StyleBox          |
| **7** Design variables   | ✅ `theme.variables` + CSS bridge; Theme tab catalog / bind to selection         |
| **8** Slots / variants   | ✅ Instance flags; slot catalog; variant presets; Advanced panel                 |
| **9** CMS bindings       | ✅ `siteConfig.collections`; CollectionList; `_binds`; Studio CMS panel          |
| **10** Interactions      | ✅ `_interactions` presets (hover/click/appear); CSS on StudioShell              |
| **11** Pages / templates | ✅ Page settings + SEO; `404` page; `siteConfig.redirects`; industry templates   |
| **12** History UX        | ✅ Timeline + named versions (`note`); rename API; restore confirm               |
| **13** AI ops            | ✅ Structured validate; destructive confirm gate (UI + API 409)                  |

**Phase 4 notes**

- Props: `_label`, `_locked`, `_hidden` on component JSON (`studio-props.ts`).
- Multi-select: `studio-selection.ts` beside Puck’s single `itemSelector` (Cmd/Ctrl+click in layers).
- `withStudioConfig` wraps every component: lock via `resolvePermissions`; hide via `StudioShell` (ghost in editor, omitted live).
- Layers tab uses `StudioLayersPanel` (rename, lock, hide, reorder, duplicate, multi-delete).

**Phase 5 notes**

- Schema: desktop/base = top-level `styles` tokens; overrides in `styles.responsive.tablet|mobile`.
- Helpers: `src/features/website-factory/puck/responsive.ts` (resolve, patch, inherit, reset, stylesheet).
- `StyleShell` / `withBoxStyles` emit `@media` rules when overrides exist (canvas iframe width matches breakpoints).
- Inspector Layout/Typography/Appearance/Responsive/Advanced edit the active breakpoint; Inherit + Reset overrides on tablet/mobile.

**Phase 6 notes**

- `LayoutControls` + `layout-presets.ts`: segmented display/flex/grid, margin/padding box, size fields, presets.
- Still writes the same StyleBox keys — no parallel layout model.
- “All fields” disclosure keeps raw token editors for power users.

**Phase 7 notes**

- Custom vars live on `project.theme.variables` (`DesignVariable`: id, name, key, value, type).
- Bridge: `themeStyle` / `themeToCssVars` emit `--wf-*` and `--wf-var-{key}` on `.factory-site`.
- Shorthand in style patches: `$primary`, `theme.accent`, `$var.space-md` → `var(...)`.
- Theme tab: `DesignVariablesPanel` (catalog, add/edit/delete, Text/Fill bind on selection).
- Persistence: `asTheme` preserves `variables` array (no DB migration — jsonb theme).

**Phase 8 notes**

- Instance flags: `_label`, `_locked`, `_hidden`, `_variant`, `_lockChildren` (`studio-props.ts`).
- Slots: `slots.ts` discovers Puck `type:"slot"` fields; registry records expose `slots[]`; cascade lock into slot trees.
- Variants: applyable presets (Flex/Grid/Heading/Button/Section/Container) + docs-only from `COMPONENT_META`; stored as `_variant`.
- Lock: `resolvePermissions` disables drag/delete/duplicate/**edit**; Advanced tab `InstanceFlagsPanel`.

**Phase 9 notes**

- Collections on `siteConfig.collections` (jsonb; no new tables). System seeds from business services/reviews/team/media.
- `CollectionList` structure block repeats cards from a collection slug.
- Field binds: `_binds` prop map; paths `business.*`, `services.0.name`, or relative entry fields; resolved in `withStudioConfig` via `CmsProvider`.
- Studio CMS rail: `CollectionsPanel` + scrape import list; Advanced: `FieldBindsPanel`.

**Phase 10 notes**

- `_interactions: { hover, click, appear }` on instance props (`interactions.ts`).
- Presets applied as CSS classes on `ae-block-shell` (`factory-site.css`); respects `prefers-reduced-motion`.
- Advanced tab: `InteractionsPanel` (hover lift/scale/fade/glow/underline; click press/pulse/bounce; appear fade-\*).

**Phase 11 notes**

- Page settings (Pages rail): slug, title, nav label, show-in-nav, per-page SEO (`root.props.title|description|noIndex`).
- Reserved slug `404`: seeded on generate; Studio “Add 404” / “Use as 404 page”; rendered on path miss before `notFound()`.
- Redirects on `siteConfig.redirects` (`{ id, from, to, permanent? }`); checked in `renderFactoryPage` (301/302 via Next redirect).
- Industry `TEMPLATE_DEFS` unchanged — 404 appended in `generatePages`.

**Phase 12 notes**

- Existing `website_versions.note` is the version name; publish accepts optional `note`.
- Studio History tab: `HistoryPanel` timeline (live badge on `publishedVersionId`), rename, restore-with-confirm, publish-from-panel.
- API: `PATCH /api/admin/websites/[id]/versions/[versionId]` `{ note }`; publish body `{ note? }`.
- Restore still loads snapshot into draft only (live unchanged until re-publish).

**Phase 13 notes**

- `ai/ops.ts`: allowlisted write ops, forced `destructive` for `removeComponent`, human confirm copy.
- Apply API requires `confirmDestructive: true` when destructive (HTTP 409 otherwise).
- Studio `AiOpsPanel`: Plan → structured op list → Confirm & apply (`window.confirm`) / Reject.
- Heuristic planner can plan testimonial remove (destructive) as well as add.

**Next implementation step:** Phase 14 — audits (SEO / a11y / perf panels with real checks only).
