# Aevion — Current State Audit

> Generated from a full repository inspection. **Do not treat this as aspirational** — it describes what exists today.
>
> Date: 2026-09-19  
> Repo: `av` (Aevion Labs)  
> Framework: Next.js **16.2.0** (App Router) · React **19.2.4** · TypeScript **5.9** · Tailwind **v4** · Supabase

---

## 1. Product shape today

Aevion is **not** yet a clean multi-tenant website factory SaaS. It is three surfaces in one Next app:

| Surface | Route group | Audience | Status |
| --- | --- | --- | --- |
| **Agency marketing site** | `(site)` | Public | Production |
| **Operator control plane** | `(admin)` | Aevion admins only | Production (operator) |
| **Published customer websites** | `(factory)` `/p`, `/s`, `/preview` | Public visitors | Production |

There is **no customer dashboard** route group and **no org/member auth**. Website Factory Studio lives under `/admin/websites/...` behind admin auth.

---

## 2. Framework & runtime

| Item | Value |
| --- | --- |
| Dev server | `npm run dev` → port **3005** (webpack) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Edge proxy | `src/proxy.ts` (session refresh + factory host rewrite) |
| Persistence | Supabase Postgres **or** JSON file fallback (`data/website-factory.json`) |
| Tests | Vitest (`npm test`) |
| CLI | `npm run aevion` → `scripts/aevion-cli.mjs` |

---

## 3. Authentication & authorization

**Who can access admin**

1. Valid Supabase session, **and**
2. `app_metadata.role` ∈ `{admin, super_admin}` **or** row in `admin_users`

Implemented in `src/lib/admin-auth.ts`, gated by `AuthGate` / `useAdminGuard` / `AdminShell`.

**API access** (`/api/v1`, MCP): Bearer `ae_live_*` API keys **or** admin session (`src/features/website-factory/developer/auth.ts` + scopes).

**Missing (desired platform):** organizations, roles (Owner/Admin/Editor/Viewer), invites, customer login, RLS for tenants (factory tables are **service_role only**).

---

## 4. Database (relevant tables)

### Website Factory (`supabase/migrations/20260918_*.sql`, `20260919_editor_engine.sql`)

| Table | Purpose |
| --- | --- |
| `businesses` (+ services/team/reviews/media) | Client business model for generation |
| `website_templates` | Catalog rows (`definition_key` → code templates) |
| `website_projects` | Website entity; includes `editor_engine` (`puck` \| `vvveb`) |
| `website_pages` | `draft_data` / `preview_data` / `published_data` jsonb |
| `website_versions` | Publish snapshots |
| `website_deployments` | Deploy history |
| `website_domains` | Domain attach + verification |
| `factory_audit_logs` | Audit |
| `factory_api_keys` / `factory_webhooks*` / `factory_integrations` | Developer platform |
| `factory_scrape_imports` | Durable scrape imports |

### Agency CMS (`supabase/cms.sql` + admin schema)

| Table | Purpose |
| --- | --- |
| `cms_pages` / `cms_sections` / `cms_projects` / `cms_settings` | Aevion marketing site CMS |
| `blog_posts` / blog media | Agency blog |
| `visitors` | Pageview analytics (**agency site only**, no `project_id`) |
| `admin_users` | Admin allow-list |

**Important:** Do not conflate agency CMS tables with Website Factory content. They are separate systems.

---

## 5. CMS — three (confusing) meanings today

| Name in UI | What it actually is | Paths |
| --- | --- | --- |
| **Agency CMS** | Structured sections for aevion.com-style site | `src/lib/cms/*`, `/api/admin/cms/*`, `/admin/settings`, blog |
| **Factory scrape CMS** | Import history / apply scrape → project | `/admin/websites/[id]/cms`, `factory_scrape_imports` |
| **“CMS” nav → `/admin/cms`** | **Embedded Vvveb PHP CMS** via `/cms` proxy | Lab only — **to be removed** |

Desired product CMS (collections, content types, media library as first-class SaaS CMS) is **not built**. Agency CMS + business model are the foundations to extend — not Vvveb.

---

## 6. Editors

### Production: Puck (Aevion Studio)

| Piece | Path |
| --- | --- |
| Shell | `src/features/website-factory/editor/AevionEditor.tsx` |
| Blocks | `components/blocks.tsx`, `puck/config.tsx` |
| Public render | `puck/SiteRender.tsx` via `FactoryDocument.tsx` |
| Entry | `/admin/websites/[id]/editor` |

Persistence: Puck JSON in `website_pages.draft_data` (etc.). Publish promotes draft → preview/published + versions.

### Prototype: VvvebJs (to remove)

| Piece | Path |
| --- | --- |
| Adapter | `src/lib/editor/vvveb-engine.ts` |
| UI | `VvvebPrototypeStudio.tsx`, Mega Studio visual/split modes |
| Assets | `/vvvebjs/[...path]` from `node_modules/vvvebjs` |
| CMS lab | `/cms` proxy → Docker `:8080`, `/admin/cms` iframe |
| Deps | `vvvebjs`, `@vvvebjs/react` (latter unused) |

### Abstraction (`src/lib/editor/`) — keep & generalize

Exists: `editor-types`, `editor-serializer`, `editor-importer`, `editor-exporter`, `editor-events`, stub `puck-engine`, live `vvveb-engine`.

**Gap:** Production Puck path **bypasses** the adapter. Engine IDs hard-coded `"puck" | "vvveb"`.

### GrapesJS

**Not present** anywhere (no package, no stubs, no docs references in code).

### Component registry

Thin start: `src/components/aevion/registry.ts` (hero, services, testimonials, contact, footer) tagged `engines: ["puck","vvveb"]`.  
Real block catalog lives in Puck `factoryConfig` / `blocks.tsx` — not yet a single canonical registry powering render + AI + MCP + Grapes.

---

## 7. Website Factory pipeline (what works)

| Capability | Status | Notes |
| --- | --- | --- |
| Create website from template | Real | Code templates + DB catalog |
| Business content model | Real | Hub `/content`, settings |
| Puck visual edit | Real | Studio |
| Preview / live path hosting | Real | `/preview`, `/p`, `/s` + wildcard host |
| Publish + version restore | Real | Explicit publish ops |
| ZIP export | Real | Puck-oriented standalone app |
| Scrape → import | Real | SSRF guards; respect robots/ethics in product copy |
| AI tools rail | Partial | Heuristic planner in `ai/tools.ts` — not full LLM factory |
| Vercel deploy | Real **when** `VERCEL_TOKEN` set; else honest idle/error | |
| Domains verify | Real DNS checks; no fake “live” | |
| GitHub connect | Real when OAuth configured | |
| MCP + `/api/v1` | Real over application services | |
| Per-site analytics | **Missing** | Only agency `visitors` |
| Orgs / customer dashboard | **Missing** | |
| GrapesJS Studio | **Missing** | |

---

## 8. Admin navigation (today)

From `AdminShell.tsx`: Overview · Websites · Templates · CMS (Vvveb embed) · Factory (dead link → redirect) · Content (blog) · Assets · Developer · System.

Per-project: Overview · Editor · Content · CMS (scrape) · Settings · Preview · Deploy.

**Gap vs desired:** No split between Platform Admin vs Customer Workspace; CMS label is overloaded; Factory nav item is stale.

---

## 9. Analytics

| Piece | Status |
| --- | --- |
| `/api/track` → `visitors` | Production for **agency** site |
| Admin visitors UI | Production on Overview |
| Factory / per-website analytics | Not built |
| Analytics SDK for published sites | Not built |
| Event model / aggregations / realtime product | Not built (raw pageviews only) |

---

## 10. API, MCP, docs

| Surface | Status |
| --- | --- |
| `/api/v1/*` | Websites, pages, publish, deploy, domains, templates, keys, webhooks, GitHub |
| `/api/mcp` | Tools mapped to same application services |
| `/openapi.json` | Present |
| In-app `/docs` | Developer portal page (`src/app/docs/page.tsx`) |
| Repo `docs/architecture/*` | Factory/editor/deployment/template/vvveb docs |

---

## 11. Vvveb inventory (removal targets)

**Must remove from Aevion app**

- Packages: `vvvebjs`, `@vvvebjs/react`
- Routes: `src/app/vvvebjs/**`, `src/app/cms/**`, `admin/cms`, `admin/vvveb-lab`, `admin/websites/[id]/vvveb`, `admin/websites/test/editor`
- Features: `VvvebPrototypeStudio`, MegaStudio visual/split, `vvveb-engine.ts`, lab portal
- Config: `VVVEB_*` env usage, next.config redirects to `/admin/cms`, `editor_engine = vvveb` create paths
- Docs/lab under `docs/vvveb*`, `integrations/vvveb` (optional keep as external lab README only)

**Must preserve**

- Puck Studio, factory store/APIs, templates, scrape, deploy/domain abstractions
- `lib/editor` interface (neutralize engine IDs)
- Agency CMS (`lib/cms`) — rename UX away from Vvveb
- Dual HTML-vs-tree render pattern in `FactoryDocument` (engine-generic)

**Sibling lab** (`Desktop/aevion-vvveb-lab`) is outside this repo — not required for Aevion product.

---

## 12. Naming collisions / risks

1. **“CMS”** means three different things — product language must be cleaned.
2. **Mega Studio** can overwrite a Puck page with Vvveb HTML if Visual mode is used — data hazard.
3. **JSON fallback store** is fine for local/dev; not multi-instance prod.
4. **Do not invent a second database** or second auth system.
5. **Do not fake** deploy/GitHub/AI/analytics numbers.

---

## 13. What is valuable to keep as platform core

```
Authentication (Supabase admin)     → extend to orgs later
Website Factory domain model        → extend, don't replace
Puck Studio shell / chrome          → become Aevion Studio host for GrapesJS
lib/editor abstraction              → GrapesJSEngine implements it
Application services + /api/v1/MCP  → keep as shared service layer
Templates + scrape + generate       → feed Grapes/component tree
Publish / versions / domains / deploy abstractions
Agency visitors tracking            → evolve into Analytics Event model
Agency CMS tables                   → optional seed for collection ideas; factory CMS is separate
```

---

## 14. Immediate conclusions

1. Vvveb is the **wrong fit** and must leave the Aevion app.
2. **Puck is production** today — removing Vvveb must not break Puck until GrapesJS is ready as a replacement path.
3. GrapesJS should arrive behind `EditorEngine`, with Aevion owning persistence and components.
4. “Build everything in one PR” will break the app — migrate in phases (see `grapesjs-migration-plan.md`).
5. Success = coherent **Aevion** product, not “Next + GrapesJS demo”.
