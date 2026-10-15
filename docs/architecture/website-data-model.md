# Website data model

Adapted from **existing** Supabase schema and TypeScript types — not a greenfield redesign.

## Ownership

```text
Business 1──* WebsiteProject 1──* WebsitePage
                │
                ├── WebsiteVersion
                ├── WebsiteDeployment
                └── WebsiteDomain

WebsiteTemplate 1──* WebsiteProject
```

Types: `src/features/website-factory/types.ts`  
Migrations: `supabase/migrations/20260918_website_factory.sql` (+ platform, scrape CMS, template seeds).

Persistence: `services/store.ts` with dual backend (`services/persistence.ts` → Supabase or `data/website-factory.json`).

---

## Tables (factory)

### `businesses`

Identity and marketing facts for generation/mapping.

Notable columns: `name`, `slug`, `tagline`, `description`, `industry`, logos/hero URLs, contact, `opening_hours` jsonb, `social` jsonb, CTAs, USPs, trust indicators.

Children:

| Table               | Role                         |
| ------------------- | ---------------------------- |
| `business_services` | Service list                 |
| `business_team`     | Team members                 |
| `business_reviews`  | Testimonials                 |
| `business_media`    | Gallery / categorized assets |

TS: `Business`, `BusinessService`, `BusinessTeam`, `BusinessReview`, `BusinessMedia`.

### `website_templates`

Catalog row pointing at code definition:

- `definition_key` → `templates/` implementation
- `configuration` jsonb
- `duplicated_from` for cloning

TS: `WebsiteTemplate`.

### `website_projects`

The “website” entity (named project in code).

- `business_id`, `template_id`
- `status`: draft | generating | ready | preview | published | archived | deployment_error
- `theme` jsonb → `ThemeTokens` (+ optional `variables: DesignVariable[]`)
- `site_config` jsonb → `SiteConfig` (+ optional `collections: CmsCollection[]`)
- `seo_config`
- `subdomain`, `custom_domain`
- `deployment_*`, `published_version_id`

TS: `WebsiteProject`.

### `website_pages`

Per-page Puck (today) payloads:

| Column           | Meaning                           |
| ---------------- | --------------------------------- |
| `draft_data`     | Working edit (default empty Puck) |
| `preview_data`   | Staged preview                    |
| `published_data` | Live                              |

Also: `slug`, `title`, `nav_label`, `show_in_nav`, `nav_order`.

TS: `WebsitePage` with `draftData` / `previewData` / `publishedData` as `PuckData`.

```ts
type PuckData = {
  root: { props?: Record<string, unknown> };
  content: PuckNode[];
  zones?: Record<string, PuckNode[]>;
};
```

### `website_versions`

`snapshot` jsonb + `version_number` + optional `author_id` / `note`.

### `website_deployments`

Provider, status, url, error — written from real provider results.

### `website_domains`

Hostname, DNS records jsonb, verification + SSL status fields.

### Platform / scrape (related)

From `20260918_factory_platform.sql` / `factory_scrape_cms.sql`:

- `factory_audit_logs`
- `factory_api_keys`, `factory_webhooks`, `factory_webhook_deliveries`
- `factory_integrations`
- `factory_scrape_imports`

---

## Access control

- RLS enabled on factory tables.
- `REVOKE` from `anon` / `authenticated`.
- `GRANT` to `service_role` only.
- Public HTML is served by Next from server-side reads, not direct table access.

---

## Theme tokens (project-level)

```ts
type ThemeTokens = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  headingFont: string;
  bodyFont: string;
  radius: string;
};
```

Applied via `puck/theme.ts` → CSS variables for blocks.

---

## Proposed additive changes (Vvveb / multi-engine)

Do **not** drop Puck columns. Prefer additive migration:

```sql
-- illustrative; not applied yet
alter table website_projects
  add column if not exists editor_engine text not null default 'puck';
  -- 'puck' | 'vvveb'

alter table website_pages
  add column if not exists document_version integer not null default 1;
  -- optional: editor_native jsonb for engine-specific fidelity
```

Rules:

1. Existing rows remain `editor_engine = 'puck'`.
2. Generators write the engine matching the template/project.
3. Public renderer selects path by `editor_engine`.
4. Never silently reinterpret Vvveb HTML as `PuckData`.

### Canonical component node (shared)

```ts
type ComponentNode = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: ComponentNode[];
  styles?: Record<string, unknown>;
  responsive?: {
    desktop?: Record<string, unknown>;
    tablet?: Record<string, unknown>;
    mobile?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
};
```

Serializers map this ↔ Puck nodes ↔ Vvveb sections.

---

## Bundle type used by Studio/hub

```ts
type ProjectBundle = {
  project: WebsiteProject;
  business: Business;
  template: WebsiteTemplate;
  pages: WebsitePage[];
  versions: WebsiteVersion[];
  deployments: WebsiteDeployment[];
  domains: WebsiteDomain[];
};
```

---

## What not to duplicate

| Concept in master prompt | Existing Aevion name                                 |
| ------------------------ | ---------------------------------------------------- |
| Website                  | `website_projects` / `WebsiteProject`                |
| Page.editorData          | `draft_data` (+ preview/published)                   |
| Assets                   | `business_media` + uploads + `public/factory-assets` |
| Organization tenancy     | Not fully modeled; admin-scoped today                |

Extend existing tables rather than creating parallel `websites` / `pages` schemas.
