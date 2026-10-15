# Aevion — GrapesJS Platform Migration Plan

> Companion to [`current-state.md`](./current-state.md).  
> Principle: **Aevion is the product. GrapesJS is replaceable editor infrastructure.**

---

## Guiding rules

1. Do not rewrite the application.
2. Do not introduce a second DB, auth, or CMS backend.
3. Do not fake integrations.
4. Prefer extending Website Factory + `lib/editor` over parallel stacks.
5. Keep Puck working until GrapesJS Studio is end-to-end for create → edit → preview → publish.
6. After each phase: typecheck, lint, tests, smoke start, remove dead code, update docs.

---

## Phase map

| Phase | Goal | Exit criteria |
| --- | --- | --- |
| **1** | Audit | `current-state.md` + this plan |
| **2** | Remove Vvveb from Aevion | No vvveb deps/routes/UI; Puck Studio sole editor; app boots |
| **3** | Neutral editor abstraction | Engine IDs pluggable; `PuckEngine` wraps production path *or* clearly documented interim |
| **4** | Install GrapesJS | Dependency + isolated mount; no product UI yet |
| **5** | Aevion Studio (Grapes) | `/admin/websites/[id]/editor` (or `/studio/...`) Grapes canvas inside Aevion chrome |
| **6** | Component registry | Canonical `lib/components` registry drives Grapes blocks + Puck bridge + docs |
| **7** | Persistence | Grapes project data in `draft_data` via serializer; Aevion owns save/load |
| **8** | Templates | Template install emits Grapes/Aevion documents |
| **9** | Scraper / AI | Map into components, not raw HTML corruption |
| **10** | Factory CMS foundation | Content types/entries (start small: posts, FAQs, services) |
| **11** | Customer workspace UX | Clear website dashboard IA (still admin-gated until orgs) |
| **12** | Analytics v1 | Event model + SDK + per-website dashboard (reuse/extend `visitors` carefully) |
| **13** | Admin IA cleanup | Grouped nav; CMS naming fixed; no dead links |
| **14** | Docs / OpenAPI / MCP | Expand `/docs`; keep MCP on application services |
| **15** | Domains / deploy / export | Harden existing providers; Grapes export path |
| **16** | Hardening | Tests, security pass, performance (lazy editor) |

---

## Phase 2 detail — Remove Vvveb (execute next)

### Delete / stop shipping

- `package.json`: `vvvebjs`, `@vvvebjs/react`
- `src/app/vvvebjs/**`
- `src/app/cms/**` (Docker CMS proxy)
- `src/app/(admin)/admin/cms/page.tsx` (Vvveb iframe) — **replace** nav target with agency settings/blog or factory content, not a blank hole
- `admin/vvveb-lab`, `admin/websites/[id]/vvveb`, `admin/websites/test/editor`
- `VvvebPrototypeStudio.tsx`, `vvveb-prototype.css`, `vvveb-engine.ts`
- MegaStudio visual/split — editor page mounts `AevionEditor` directly
- Create-website `editorEngine: "vvveb"` paths; WebsiteList “New Vvveb site”
- next.config redirects to `/admin/cms`
- Env references to `VVVEB_*` in code (document removal in `.env.example` if present)

### Refactor (do not delete)

- `EditorEngineId`: `"puck" | "grapesjs"` (or keep `"puck"` only until Grapes lands)
- `VvvebPageDocument` → deprecate; migrate any `editor_engine=vvveb` rows to puck empty doc or archive
- SQL check constraint: migration to drop `vvveb` from allowed engines
- `FactoryDocument` HTML iframe branch → generic `html` engine or remove if unused
- Registry `engines` arrays
- Architecture docs: mark vvveb docs historical

### Admin nav after Phase 2

- Remove “CMS” → Vvveb embed
- Point content ops to `/admin/blog` + `/admin/settings` and/or websites content until Phase 10 CMS UI exists
- Fix “Factory” dead link

### Verify

- `/admin/websites` list + create (Puck)
- `/admin/websites/[id]/editor` loads AevionEditor
- Preview/publish still work
- `/api/v1` + MCP smoke
- `rg -i vvveb src` → empty (docs may remain under `docs/` as historical)

---

## Phase 3–7 — Editor strategy (summary)

```
Aevion Studio chrome (keep)
        ↓
   EditorEngine API
        ↓
 ┌──────┴──────┐
 PuckEngine   GrapesJSEngine   (Puck remains until Grapes parity)
        ↓
 website_pages.draft_data (Aevion-owned JSON)
```

**Persistence rule:** Grapes project JSON is the editor representation inside an Aevion envelope:

```ts
{
  version: 1,
  engine: "grapesjs",
  tree?: ComponentDefinition[],  // preferred for AI/templates
  native: GrapesProjectData,     // round-trip fidelity
}
```

HTML/CSS export is a **derived artifact**, never the sole source of truth.

---

## Phase 10 — CMS strategy (do not duplicate)

- **Agency** `cms_*` stays for the marketing site.
- **Factory CMS** = new content types scoped to `website_projects` / organizations (Phase 11+).
- Scrape imports remain an import pipeline into websites/CMS entries — not a competing CMS.
- No Vvveb PHP, no WordPress embed, no second Postgres project.

---

## Phase 12 — Analytics strategy

- Introduce `AnalyticsEvent`-shaped writes (table or evolve `visitors`).
- Scope by `website_id` / `project_id`.
- Ship lightweight browser SDK for factory sites.
- Do not install a third-party dashboard and call it “Aevion Analytics”.
- Privacy: consent hooks, retention, no invasive fingerprinting by default.

---

## Explicit non-goals for early phases

- Full billing implementation
- ClickHouse
- Customer self-serve auth (design for it; don’t block Studio on it)
- Replacing Supabase or Next.js
- Pixel-perfect Grapes demo skins

---

## Success criteria (condensed)

Vvveb gone · Puck unbroken during transition · Grapes behind Aevion Studio · Aevion owns data/components/templates/CMS/publish/deploy/analytics/API/MCP · no fake features · maintainable phased delivery.
