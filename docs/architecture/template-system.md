# Template system

## Current design

Templates are **not** static HTML dumps. They are:

1. A **catalog row** in `website_templates` (`definition_key`, metadata, `configuration`).
2. A **code definition** under `src/features/website-factory/templates/`.
3. A **generator** in `mapping/generate.ts` that maps `Business` + theme → `WebsitePage[]` (`PuckData`).

Seeds: `templates/seeds.ts` + migration `20260918_factory_templates_seed.sql`.

### Flow

```text
Business data
    +
Template.definition_key
    +
ThemeTokens / SiteConfig / SeoConfig
    ↓
services/generate.ts
    ↓
mapping/generate.ts
    ↓
Pages with draft_data (Puck)
    ↓
Studio / Preview / Publish
```

Modes in use: preserve / rebuild / rewrite (generation + scrape apply paths).

---

## Template record fields

| Field                                     | Purpose          |
| ----------------------------------------- | ---------------- |
| `slug`, `name`, `industry`, `description` | Catalog UX       |
| `thumbnail_url`                           | Admin grid       |
| `definition_key`                          | Code lookup      |
| `pages_count`                             | Hint for UI      |
| `configuration`                           | Extra JSON knobs |
| `duplicated_from`                         | Clone lineage    |
| `active`                                  | Soft enable      |

Duplication must clone catalog + leave **code definition** shared or fork carefully — client projects never mutate the shared template definition in place.

---

## Business → component mapping

Generator binds structured business fields into block props, for example:

| Business field                    | Typical block prop        |
| --------------------------------- | ------------------------- |
| `name` / tagline                  | Hero title / eyebrow      |
| `description`                     | About / hero body         |
| `services[]`                      | Services / features lists |
| `phone` / `email` / `address`     | Contact / header CTA      |
| `reviews[]`                       | Testimonials              |
| `team[]`                          | Team section              |
| `media[]` / `heroUrl` / `logoUrl` | Images                    |
| `primaryCta` / `secondaryCta`     | Buttons                   |
| `openingHours`                    | Hours block               |
| `social`                          | Social links / footer     |

Do **not** hardcode one-off sites; keep mappings in the template definition + generator.

---

## Target template package shape

Align catalog `configuration` and filesystem packages toward:

```text
Template
├── metadata (industry, name, version)
├── pages[] (slug, title, nav)
├── component tree defaults
├── theme defaults
├── content mappings (business paths → props)
├── SEO defaults
├── assets placeholders
└── engine hint (puck | vvveb)   # future
```

Code modules to grow (names illustrative; prefer extending existing files):

```text
templates/
  index.ts              # registry / loader
  seeds.ts
  <definition_key>.ts   # page graphs + mappings
```

Future helpers (only if needed): `template-validator`, `template-instantiator`, `template-preview` — as thin wrappers over current generate + admin TemplateList.

---

## Industries / definition keys

Concrete keys live in seeds and generator tests (`mapping/generate.test.ts`). Examples include roofing, professional, restaurant-style verticals — treat the seed file as authoritative, not this doc’s list.

---

## Vvveb impact

- Phase 1–4: generators continue emitting **Puck** trees.
- When a `vvveb` template engine exists, either:
  - generate Aevion component trees then serialize to Vvveb, or
  - maintain parallel template definitions per engine (higher cost — avoid until necessary).
- Prefer **one** template definition → serializer per engine.

---

## Cloning policy

| Action                 | Expected behavior                                               |
| ---------------------- | --------------------------------------------------------------- |
| Duplicate template     | New `website_templates` row; shared or forked `definition_key`  |
| Duplicate website      | New project + pages copy; independent business link as required |
| Duplicate page/section | Page CRUD / editor operations                                   |

Original template remains immutable for other clients.
