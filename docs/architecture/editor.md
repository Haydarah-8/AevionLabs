# Aevion Studio & Editor Engine

> Principle: **Aevion owns the website. Puck is the permanent visual engine.**

> Status (2026-09-19): **Phase 2** — headless `PuckEngine` active for API/AI/MCP mutations. Studio chrome still uses compositional Puck UI.

See also: [`editor-current-state.md`](./editor-current-state.md) · [`current-state.md`](./current-state.md)

## Current Studio (production)

Entry: `/admin/websites/[id]/editor`

Implementation: `src/features/website-factory/editor/AevionEditor.tsx`

| Region | Implementation |

| --------------- | ----------------------------------------- |

| Canvas | `@puckeditor/core` `<Puck>` |

| Left rail | Pages, tools, layers, assets, import, AI |

| Inspector | `ContextualInspector.tsx` |

| Bottom bar | `StudioBottomBar.tsx` |

| Command palette | `StudioCommandPalette.tsx` |

| Hover toolbar | `StudioActionBar.tsx` |

Persistence: autosave → page draft JSON → publish promotes draft.

## Editor abstraction

```text

src/lib/editor/

  editor-types.ts       # EditorEngineId = "puck"

  editor-engine.ts      # barrel

  puck-engine.ts        # headless PuckEngine (API / AI / MCP)

  editor-serializer.ts  # PageDocument ↔ AevionPageDocument

  editor-importer.ts

  editor-exporter.ts

  editor-events.ts

```

Legacy HTML page envelopes (`engine: "vvveb" | "html"`) remain **readable**.

Accidental Grapes envelopes normalize to empty Puck for tooling — not an active engine.

### Who uses what

| Consumer | Path |

| --- | --- |

| Studio UI | Direct `@puckeditor/core` compositional APIs |

| Component CRUD API / MCP | `application/components.ts` → `PuckEngine` |

| Persistence | Always `PuckData` on `website_pages.draft_data` |

## Policy

1. **Do not** introduce Vvveb, GrapesJS, or Webstudio.

2. **Do not** retire Puck.

3. Extend Aevion systems; do not create a second CMS or database.

## Next (Phase 4)

Canvas / layers improvements (multi-select foundation, layers rename/lock/hide persisted).

## Phase 3 — Canonical registry

```text
src/features/website-factory/registry/
  types.ts
  build-registry.ts   # derives from factoryConfig + COMPONENT_META
  index.ts            # list/get/docs/stats
```

- Every Puck component type is in the registry.
- `listComponentSchemas` / MCP `aevion://components` / AI tool lists use the registry.
- `src/components/aevion/registry.ts` re-exports for compatibility.
- Puck `factoryConfig` remains the render source; registry is the catalog source.
