# Aevion Website Factory — Architecture

> Status: **Phase 1 audit complete** (2026-09-19).  
> Source of truth: this repo’s `src/features/website-factory/` + Supabase migrations.  
> Principle: **Aevion owns the platform; the visual editor is a pluggable engine.**

## 1. Existing architecture (as implemented)

### Stack

| Layer                   | Choice                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Framework               | Next.js **16.2.0** App Router                                                        |
| UI                      | React **19.2.4**, TypeScript **5.9.3**                                               |
| Styling                 | Tailwind CSS v4 (`globals.css`, `admin-theme.css`, `factory-site.css`, `studio.css`) |
| Editor engine (current) | `@puckeditor/core` **^0.23.0**                                                       |
| Data                    | Supabase Postgres (service role) with JSON file fallback                             |
| Auth                    | Supabase Auth + `admin_users` / `app_metadata.role`                                  |
| Package manager         | npm (`package-lock.json`)                                                            |
| Tests                   | Vitest 4 under `src/features/website-factory/**/*.test.ts`                           |
| Dev server              | Port **3005**                                                                        |

No Prisma/Drizzle. No shadcn factory kit. No VvvebJs in the tree today.

### Product map (pillars)

Defined in `src/features/website-factory/platform/pillars.ts`:

1. **Puck** — editor engine inside Studio
2. **Aevion Core** — businesses, websites, pages, scrape, deploy, audit
3. **API** — `/api/v1` + OpenAPI + SDK + CLI
4. **MCP** — `/api/mcp` over the same application services
5. **Skills / Connect / Docs** — developer surfaces

### Runtime topology

```text
Admin Studio (AevionEditor + Puck)
        │
        ▼
application/*  →  services/store.ts
        │
        ├─ Supabase (service_role)     OR
        └─ data/website-factory.json   (fallback when tables missing)

Public render:
  /preview/{slug}  → draft
  /p/{slug}        → preview
  /s/{slug}        → live (+ optional FACTORY_WILDCARD_DOMAIN rewrite in proxy.ts)

Deploy:
  export/zip.ts → optional deployment/vercel.ts (VERCEL_TOKEN)
```

### Feature root

Everything factory-related lives under:

```text
src/features/website-factory/
  application/     # use-cases (website, page, scrape, deploy, AI, …)
  services/        # store, generate, persistence, health, public
  editor/          # Aevion Studio chrome around Puck
  puck/            # config, render, theme, style fields, meta
  components/      # React blocks (Hero, Services, …)
  templates/       # definition keys + seeds
  mapping/         # business + template → Puck pages
  intelligence/    # scrape, SSRF, assets, apply, rewrite
  deployment/      # Vercel adapter
  export/          # ZIP export
  integrations/    # MCP, GitHub
  developer/       # API keys, scopes, skills, connect
  admin/           # list, hub, wizard, panels
  public/          # FactoryDocument + render helpers
  ai/              # structured AI tools (heuristic planner)
  sdk/             # typed client
  platform/        # pillars product map
```

### Admin routes (do not duplicate)

| Route                           | Role                                       |
| ------------------------------- | ------------------------------------------ |
| `/admin/websites`               | List                                       |
| `/admin/websites/new`           | Blank canvas → editor                      |
| `/admin/websites/templates`     | Template catalog                           |
| `/admin/websites/[id]`          | Project hub                                |
| `/admin/websites/[id]/editor`   | Studio (fullBleed)                         |
| `/admin/websites/[id]/content`  | Business content                           |
| `/admin/websites/[id]/settings` | Project settings                           |
| `/admin/websites/[id]/preview`  | Preview panel                              |
| `/admin/websites/[id]/deploy`   | Deploy panel                               |
| `/admin/websites/[id]/cms`      | Scrape CMS imports                         |
| `/admin/developer/**`           | API, MCP, skills, connect, audit, webhooks |

### Parallel product (agency marketing site)

`(site)` public marketing + agency CMS (`/admin/blog`, news, visitors) is **separate** from Website Factory. Do not merge schemas or editors.

---

## 2. Proposed architecture (VvvebJs integration)

### Non-negotiable split

```text
Aevion (source of truth)
  businesses · projects · pages · assets · templates
  scrape · AI · API · MCP · deploy · domains · versions
        │
        ▼
EditorEngine abstraction
  ├── PuckEngine   (current production)
  └── VvvebEngine  (prototype → optional production)
        │
        ▼
Aevion Renderer (engine-agnostic public HTML/React)
```

VvvebJs must **not** own auth, billing, domains, deployments, API keys, MCP, or tenancy.

### Why an abstraction first

Today every layer assumes `PuckData`:

- DB columns `draft_data` / `preview_data` / `published_data`
- Generator `mapping/generate.ts`
- Public `SiteRender`
- Export ZIP depends on `@puckeditor/core`
- AI tools + MCP mutate Puck nodes by `type` / `props`

Blindly replacing Puck would break the factory. The migration path is:

```text
Phase 2  Vvveb prototype route (isolated)
Phase 3  EditorEngine + serializers
Phase 4  Studio shell driven by engine interface
Phase 5+ Dual render/export only after parity gates pass
```

### Canonical document model (target)

Aevion keeps a **structured page model** (component tree with typed props). Engines adapt to/from that model:

```text
Aevion Page Document
   ↕  editor-serializer
PuckData  |  Vvveb document HTML/CSS/sections
   ↕
Public Renderer / Export
```

Short-term: keep storing `PuckData` for production sites.  
Vvveb prototypes may store an alternate payload under an `editor_engine` discriminator (see [website-data-model.md](./website-data-model.md)).

### Data flow (end-to-end, unchanged ownership)

```text
URL / form
  → SSRF-safe scrape (intelligence/*)
  → Business + media
  → Template definition_key
  → Generator → pages (draft)
  → Studio (EditorEngine)
  → Autosave draft
  → Preview / Publish versions
  → Deploy provider OR ZIP export
  → Same capabilities via /api/v1 and MCP
```

---

## 3. Pipeline responsibilities

| Pipeline  | Owner today                                   | Notes                                                    |
| --------- | --------------------------------------------- | -------------------------------------------------------- |
| Scrape    | `intelligence/*`, `application/scrape.ts`     | SSRF in `ssrf.ts`; assets under `public/factory-assets/` |
| Generate  | `services/generate.ts`, `mapping/generate.ts` | Deterministic template mapping; AI optional              |
| Edit      | `editor/AevionEditor.tsx` + Puck              | Studio chrome is already Aevion-branded                  |
| Render    | `puck/SiteRender.tsx`, `(factory)` routes     | Independent of admin UI                                  |
| Export    | `export/zip.ts`                               | Standalone Next+Puck app ZIP                             |
| Deploy    | `deployment/vercel.ts`                        | Honest idle when `VERCEL_TOKEN` missing                  |
| Domains   | `website_domains` + verify APIs               | No fake “connected”                                      |
| API / MCP | `api/v1/*`, `integrations/mcp-server.ts`      | Shared application services                              |

---

## 4. Security & multi-tenancy (current)

- Factory tables: RLS on; **anon/authenticated revoked**; **service_role** only.
- Admin session required for `/admin` and `/api/admin/*`.
- API keys (`ae_live_…`) with scopes in `developer/scopes.ts`.
- Scrape: reject localhost / private / metadata IPs; limit depth/size/timeouts.
- Secrets (Vercel, GitHub OAuth, Supabase service role) stay server-side.

Gaps vs master vision: org-level multi-tenancy is thin (admin-centric); factory analytics not project-scoped.

---

## 5. Migration strategy (Puck → optional Vvveb)

1. **Do not delete Puck.**
2. Introduce `EditorEngine` with `PuckEngine` wrapping current Studio.
3. Add isolated `/admin/websites/test/editor` (or `[id]/editor?engine=vvveb`) prototype.
4. Prove: load/save, components, responsive, serialize, export path.
5. Only then: dual `editor_engine` on `website_projects`, dual renderer, migration tools.
6. Remove Puck only after data migration + regression suite + rollback plan.

---

## 6. Implementation phases (bound to this repo)

| Phase                | Deliverable                                                                                                             | Status                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 1 Audit + docs       | This folder + legal                                                                                                     | **Done**                                      |
| 2 Vvveb prototype    | `/admin/websites/test/editor`, `VvvebEngine`, `/vvvebjs/*`                                                              | **Done**                                      |
| 3 Editor adapter     | `src/lib/editor/*` (engine, serializer, importer, exporter, events)                                                     | **Done**                                      |
| 4 Studio unification | Aevion chrome + `/[id]/vvveb` project Studio                                                                            | **Started**                                   |
| 5 Data model flags   | `editor_engine` + `PageDocument` union                                                                                  | **Done** (apply `20260919_editor_engine.sql`) |
| 6–17                 | Templates, factory UX polish, preview, versions, deploy, export, API, MCP, integrations, skills, docs portal, hardening | Mostly exist for Puck; extend per engine      |

---

## 7. Related docs

- [editor.md](./editor.md) — Studio + engine abstraction
- [website-data-model.md](./website-data-model.md) — tables & TypeScript types
- [template-system.md](./template-system.md) — templates & generation
- [deployment.md](./deployment.md) — preview, publish, Vercel, domains, export
- [../legal/open-source-licenses.md](../legal/open-source-licenses.md) — licenses
