# Preview, publish, deployment & export

## Preview modes (implemented)

URL helpers: `src/features/website-factory/urls.ts`  
Routes: `src/app/(factory)/`

| Mode    | Path                | Data source      |
| ------- | ------------------- | ---------------- |
| Draft   | `/preview/{slug}/…` | `draft_data`     |
| Preview | `/p/{slug}/…`       | `preview_data`   |
| Live    | `/s/{slug}/…`       | `published_data` |

Optional: `FACTORY_WILDCARD_DOMAIN` in `proxy.ts` rewrites host → `/s/{slug}`.

Renderer: `puck/SiteRender.tsx` + `public/FactoryDocument.tsx` — **independent of Studio**. Editor is not the website.

Viewports for operators: Studio bottom bar + Preview panel (`admin/PreviewPanel.tsx`).

---

## Publish & versions

- Promote draft → preview / live via application + store publish helpers.
- `website_versions` stores snapshots (`version_number`, `snapshot` jsonb).
- `website_projects.published_version_id` / `published_at` track live pointer.
- Rollback = restore snapshot into draft (and optionally re-publish) — keep previous versions.

Statuses on project: `draft` → `ready` / `preview` → `published` (plus `generating`, `archived`, `deployment_error`).

**Rule:** UI must not show Published / Deployed unless store + provider agree.

---

## Deployment provider abstraction

Current adapter: `deployment/vercel.ts`  
Orchestration: `application/deployment.ts`  
Admin UI: `admin/DeployPanel.tsx`, route `/admin/websites/[id]/deploy`

### Behavior

- If `VERCEL_TOKEN` (and related config) present → create deployment, record `website_deployments`.
- If missing → status remains idle / not configured — **no fake success**.

Target interface (align code toward this):

```ts
interface DeploymentProvider {
  deploy(input: DeployInput): Promise<DeployResult>;
  getDeployment(id: string): Promise<DeployStatus>;
  getStatus(projectId: string): Promise<DeployStatus>;
  cancel?(id: string): Promise<void>;
  remove?(id: string): Promise<void>;
}
```

Providers: `vercel` (implemented), `aevion` hosting (placeholder name on project default), future others behind the same interface.

---

## Custom domains

Table: `website_domains`  
APIs: admin/v1 domain + verify routes.

Flow:

1. Attach hostname to project
2. Emit DNS instructions (CNAME / TXT as implemented)
3. Verify DNS
4. Update `status` / `ssl_status` / `verified_at`

Never claim Active until verification succeeds.

---

## Export (ZIP)

Implementation: `export/zip.ts` (JSZip).

Today’s artifact: standalone Next app that depends on **Puck render** of stored JSON — not an Aevion-dashboard runtime.

Target invariant (any engine):

```text
Aevion Website Model
  → Renderer / Generator
  → Standalone website files
  → website.zip
```

Exported sites must not require the Aevion admin app to run.

Vvveb-era export may emit static HTML/CSS/JS **or** continue React render from structured documents — decide per engine after prototype, keep ZIP entrypoint stable for API/MCP (`export_website`).

---

## GitHub integration

`integrations/github.ts` + Connect developer UI — export/OAuth when configured. Same honesty rule: disconnected until OAuth/token succeeds.

---

## API & MCP surface (deployment-related)

v1 and MCP expose deploy/publish/export/domain tools over **application services**, not duplicate logic. See `integrations/mcp-server.ts` and `/openapi.json`.

---

## Observability

- `factory_audit_logs` for platform actions
- Deployment rows for provider history
- Job-style scrape imports in `factory_scrape_imports`

Extend structured logging for generate / AI / export failures with terminal states: queued | running | completed | failed | cancelled.
