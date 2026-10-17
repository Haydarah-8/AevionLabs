"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createUsePuck, Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "@/app/factory-site.css";
import "./studio.css";
import { factoryConfig } from "@/features/website-factory/puck/config";
import { withStudioConfig } from "@/features/website-factory/editor/withStudioConfig";
import { StudioLayersPanel } from "@/features/website-factory/editor/StudioLayersPanel";
import {
  clearStudioSelection,
  getStudioSelection,
} from "@/features/website-factory/editor/studio-selection";
import {
  isLayerLocked,
  STUDIO_PROP,
} from "@/features/website-factory/editor/studio-props";
import type { StyleBox } from "@/features/website-factory/puck/styles";
import {
  breakpointFromWidth,
  patchStylesAtBreakpoint,
  resolveStyleBox,
  type StudioBreakpoint,
} from "@/features/website-factory/puck/responsive";
import { themeStyle } from "@/features/website-factory/puck/theme";
import { patchStyleWithThemeRefs } from "@/features/website-factory/puck/design-variables";
import { DesignVariablesPanel } from "@/features/website-factory/editor/DesignVariablesPanel";
import { CmsProvider } from "@/features/website-factory/cms/CmsContext";
import { listCollections } from "@/features/website-factory/cms/collections";
import { CollectionsPanel } from "@/features/website-factory/editor/CollectionsPanel";
import { PageSettingsPanel } from "@/features/website-factory/editor/PageSettingsPanel";
import { RedirectsPanel } from "@/features/website-factory/editor/RedirectsPanel";
import { HistoryPanel } from "@/features/website-factory/editor/HistoryPanel";
import { AiOpsPanel } from "@/features/website-factory/editor/AiOpsPanel";
import { AuditsPanel } from "@/features/website-factory/editor/AuditsPanel";
import type { AiPlan } from "@/features/website-factory/ai/tools";
import { analyzeAiPlan } from "@/features/website-factory/ai/ops";
import {
  isNotFoundPageSlug,
  NOT_FOUND_PAGE_SLUG,
  patchPageSeo,
} from "@/features/website-factory/pages/settings";
import { displayVersionName } from "@/features/website-factory/history/versions";
import type { BindContext } from "@/features/website-factory/cms/bindings";
import type { HealthReport } from "@/features/website-factory/services/health";
import type {
  PuckData,
  ProjectBundle,
  ThemeTokens,
  WebsitePage,
  PageDocument,
  SiteConfig,
  WebsiteVersion,
} from "@/features/website-factory/types";
import { emptyPuck, isPuckData } from "@/features/website-factory/types";
import {
  factoryDraftPath,
  factoryLivePath,
  factoryPreviewPath,
} from "@/features/website-factory/urls";
import type { HealthIssue } from "@/features/website-factory/services/health";
import type { IntelligenceResult } from "@/features/website-factory/intelligence/types";
import {
  StudioCommandPalette,
  type StudioCommand,
} from "@/features/website-factory/editor/StudioCommandPalette";
import {
  StudioBottomBar,
  type BottomUtility,
} from "@/features/website-factory/editor/StudioBottomBar";
import { ContextualInspector } from "@/features/website-factory/editor/ContextualInspector";
import type { InspectorTab } from "@/features/website-factory/editor/inspector-tabs";
import { CanvasHeightSync } from "@/features/website-factory/editor/CanvasHeightSync";
import {
  StudioActionBar,
  StudioComponentOverlay,
  getStyleClipboard,
  setStyleClipboard,
} from "@/features/website-factory/editor/StudioActionBar";
import { StudioToolsPanel } from "@/features/website-factory/editor/StudioToolsPanel";
import type { StudioTool } from "@/features/website-factory/editor/studio-tools";
import {
  Archive,
  Boxes,
  Briefcase,
  Cable,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileStack,
  Focus,
  Globe,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Layers,
  Link2,
  Maximize2,
  Monitor,
  Redo2,
  Smartphone,
  Sparkles,
  Tablet,
  Undo2,
  Upload,
  Wrench,
} from "lucide-react";
import { StudioBusinessPanel } from "@/features/website-factory/editor/StudioBusinessPanel";

const studioConfig = withStudioConfig(factoryConfig);

function studioPuck(doc: PageDocument | null | undefined): PuckData {
  return doc && isPuckData(doc) ? doc : emptyPuck();
}

const useEditorPuck = createUsePuck();

let blockClipboard: { type: string; props: Record<string, unknown> } | null =
  null;

function hexColor(value?: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value || "") ? value! : "#111111";
}

type SaveState = "saved" | "saving" | "failed";
type LeftTab =
  | "pages"
  | "site"
  | "add"
  | "tools"
  | "layers"
  | "assets"
  | "import"
  | "cms"
  | "history"
  | "ai"
  | "api"
  | "deploy";
type RightTab = InspectorTab;

type ApplyFields = {
  identity: boolean;
  contact: boolean;
  services: boolean;
  reviews: boolean;
  media: boolean;
  social: boolean;
};

const VIEWPORTS = [
  { id: "desktop", width: 1280 as const, label: "Desktop", Icon: Monitor },
  { id: "tablet", width: 768 as const, label: "Tablet", Icon: Tablet },
  { id: "mobile", width: 390 as const, label: "Mobile", Icon: Smartphone },
  { id: "wide", width: 1440 as const, label: "Large", Icon: Maximize2 },
];

function CanvasFrame({
  children,
  document: frameDoc,
  theme,
  siteConfig,
  business,
}: {
  children: ReactNode;
  document?: Document;
  theme: ThemeTokens;
  siteConfig?: SiteConfig | null;
  business?: BindContext["business"];
}) {
  useEffect(() => {
    if (!frameDoc) return;
    const html = frameDoc.documentElement;
    const body = frameDoc.body;
    html.setAttribute("data-factory-canvas", "true");
    html.style.colorScheme = "light";
    html.style.background = "#ffffff";
    body.style.margin = "0";
    body.style.padding = "0";
    body.style.background = "#ffffff";
    body.style.color = "#111111";
    body.style.minHeight = "0";
    body.style.height = "auto";
    body.style.overflowX = "hidden";
    body.style.overflowY = "visible";

    // Force light site chrome even if host admin CSS was mirrored in.
    let style = frameDoc.getElementById(
      "aevion-canvas-reset",
    ) as HTMLStyleElement | null;
    if (!style) {
      style = frameDoc.createElement("style");
      style.id = "aevion-canvas-reset";
      frameDoc.head.appendChild(style);
    }
    style.textContent = `
      html, body { background:#fff !important; color:#111 !important; color-scheme:light !important; }
      .factory-site {
        background: var(--wf-bg, #fff) !important;
        color: var(--wf-fg, #111) !important;
        color-scheme: light !important;
        min-height: 100%;
      }
      .factory-site .wf-lede,
      .factory-site .wf-kicker { color: var(--wf-secondary, #3f3f3f) !important; }
      .factory-site .wf-btn {
        background: var(--wf-fg, #111) !important;
        color: var(--wf-bg, #fff) !important;
        border-color: var(--wf-fg, #111) !important;
      }
      .factory-site .wf-btn.is-ghost {
        background: transparent !important;
        color: var(--wf-fg, #111) !important;
      }
      .factory-site .wf-announce {
        background: var(--wf-fg, #111) !important;
        color: var(--wf-bg, #fff) !important;
      }
      [data-puck-component] { cursor: grab !important; }
      [data-puck-component][data-dnd-dragging] { cursor: grabbing !important; opacity: 0.92; }
      .ae-overlay { position: relative; outline: 1px dashed transparent; outline-offset: -1px; }
      .ae-overlay.is-hover { outline-color: rgba(37, 99, 235, 0.55); }
      .ae-overlay.is-selected { outline: 2px solid #2563eb; outline-offset: -2px; }
      .ae-overlay-tag {
        position: absolute; top: 4px; left: 4px; z-index: 6; pointer-events: none;
        padding: 1px 6px; border-radius: 4px; background: rgba(17,17,17,0.9);
        color: #dbeafe; font-size: 9px; font-weight: 650; letter-spacing: 0.04em;
        text-transform: uppercase;
      }
    `;
  }, [frameDoc, theme]);

  return (
    <div className="factory-site" style={themeStyle(theme)}>
      <CmsProvider
        collections={listCollections(siteConfig)}
        business={business}
      >
        {children}
      </CmsProvider>
    </div>
  );
}

export function AevionEditor({ id }: { id: string }) {
  const [bundle, setBundle] = useState<ProjectBundle | null>(null);
  const [pageId, setPageId] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<PuckData | null>(null);
  const pageIdRef = useRef(pageId);

  useEffect(() => {
    pageIdRef.current = pageId;
  }, [pageId]);

  useEffect(() => {
    void fetch(`/api/admin/websites/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setBundle(data);
        setPageId(data.pages?.[0]?.id ?? "");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      );
  }, [id]);

  const page =
    bundle?.pages.find((item) => item.id === pageId) ?? bundle?.pages[0];

  const persist = useCallback(
    async (targetId: string, data: PuckData) => {
      setSaveState("saving");
      try {
        const res = await fetch(`/api/admin/websites/${id}/pages/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || "Save failed");
        }
        setSaveState("saved");
        setBundle((current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((item) =>
                  item.id === targetId ? { ...item, draftData: data } : item,
                ),
              }
            : current,
        );
      } catch (err) {
        setSaveState("failed");
        setError(err instanceof Error ? err.message : "Save failed");
      }
    },
    [id],
  );

  function queueSave(data: PuckData) {
    latest.current = data;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const target = pageIdRef.current;
      if (target && latest.current) void persist(target, latest.current);
    }, 800);
  }

  if (error && !bundle) {
    return (
      <div className="ae-editor-root">
        <p className="p-6 text-sm text-red-400">{error}</p>
      </div>
    );
  }
  if (!bundle || !page) {
    return (
      <div className="ae-editor-root">
        <p className="p-6 text-sm text-zinc-500">Loading studio…</p>
      </div>
    );
  }

  return (
    <div className="ae-editor-root">
      <Puck
        key={page.id}
        config={studioConfig}
        data={studioPuck(page.draftData)}
        height="100%"
        iframe={{ enabled: true, syncHostStyles: true }}
        ui={{
          viewports: {
            current: { width: 1280, height: "auto" },
            controlsVisible: false,
            options: VIEWPORTS.map((item) => ({
              width: item.width,
              height: "auto" as const,
              label: item.label,
            })),
          },
        }}
        viewports={VIEWPORTS.map((item) => ({
          width: item.width,
          height: "auto" as const,
          label: item.label,
        }))}
        onChange={(data) => queueSave(data as PuckData)}
        onPublish={(data) => void persist(page.id, data as PuckData)}
        permissions={{
          drag: true,
          duplicate: true,
          delete: true,
          edit: true,
          insert: true,
        }}
        overrides={{
          iframe: ({ children, document: frameDoc }) => (
            <CanvasFrame
              document={frameDoc}
              theme={bundle.project.theme}
              siteConfig={bundle.project.siteConfig}
              business={bundle.business}
            >
              {children}
            </CanvasFrame>
          ),
          actionBar: StudioActionBar,
          componentOverlay: StudioComponentOverlay,
        }}
      >
        <StudioChrome
          id={id}
          bundle={bundle}
          page={page}
          saveState={saveState}
          error={error}
          notice={notice}
          latest={latest}
          setBundle={setBundle}
          setPageId={setPageId}
          setError={setError}
          setNotice={setNotice}
          persist={persist}
        />
      </Puck>
    </div>
  );
}

function StudioChrome({
  id,
  bundle,
  page,
  saveState,
  error,
  notice,
  latest,
  setBundle,
  setPageId,
  setError,
  setNotice,
  persist,
}: {
  id: string;
  bundle: ProjectBundle;
  page: WebsitePage;
  saveState: SaveState;
  error: string;
  notice: string;
  latest: { current: PuckData | null };
  setBundle: (
    value:
      | ProjectBundle
      | ((current: ProjectBundle | null) => ProjectBundle | null),
  ) => void;
  setPageId: (id: string) => void;
  setError: (value: string) => void;
  setNotice: (value: string) => void;
  persist: (pageId: string, data: PuckData) => Promise<void>;
}) {
  const history = useEditorPuck((s) => s.history);
  const dispatch = useEditorPuck((s) => s.dispatch);
  const viewports = useEditorPuck((s) => s.appState.ui?.viewports);
  const selectedItem = useEditorPuck((s) => s.selectedItem);
  const itemSelector = useEditorPuck((s) => s.appState.ui?.itemSelector);
  const getSelectorForId = useEditorPuck((s) => s.getSelectorForId);
  const getParentById = useEditorPuck((s) => s.getParentById);
  const [left, setLeft] = useState<LeftTab>(
    bundle.business.name === "Untitled site" ? "site" : "pages",
  );
  const [leftOpen, setLeftOpen] = useState(false);
  const [right, setRight] = useState<RightTab>("content");
  const [command, setCommand] = useState("");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(100);
  const [focusMode, setFocusMode] = useState(false);
  const [blockQuery, setBlockQuery] = useState("");
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [planConfirmMessage, setPlanConfirmMessage] = useState<string | null>(
    null,
  );
  const [health, setHealth] = useState<{
    issues: HealthIssue[];
    summary: string;
  } | null>(null);
  const [scrape, setScrape] = useState<IntelligenceResult | null>(null);
  const [scrapeUrl, setScrapeUrl] = useState(bundle.business.website || "");
  const [scrapeStep, setScrapeStep] = useState("");
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const scrapeAbortRef = useRef<AbortController | null>(null);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [applyFields, setApplyFields] = useState<ApplyFields>({
    identity: true,
    contact: true,
    services: true,
    reviews: true,
    media: true,
    social: true,
  });
  const [applyColors, setApplyColors] = useState(true);
  const [mcpTools, setMcpTools] = useState<
    Array<{ name: string; description: string }>
  >([]);
  const [busy, setBusy] = useState("");
  const [domainHostname, setDomainHostname] = useState("");
  const [deployStatus, setDeployStatus] = useState<{
    configured: boolean;
    message: string;
  } | null>(null);
  const [cmsImports, setCmsImports] = useState<
    Array<{
      id: string;
      title: string;
      sourceUrl: string;
      status: string;
      pageCount: number;
      assetCount: number;
      createdAt: string;
      summary: string;
    }>
  >([]);
  const [cmsImportId, setCmsImportId] = useState<string | null>(null);
  const [assetQuery, setAssetQuery] = useState("");
  const [assetKind, setAssetKind] = useState("all");
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [deviceWidth, setDeviceWidth] = useState(1280);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [bottomUtility, setBottomUtility] = useState<BottomUtility | null>(
    null,
  );
  const commandRef = useRef<HTMLTextAreaElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const width = deviceWidth;

  useEffect(() => {
    if (!notice && !error) return;
    const t = window.setTimeout(() => {
      setNotice("");
      setError("");
    }, 4500);
    return () => window.clearTimeout(t);
  }, [notice, error]);

  const pages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bundle.pages;
    return bundle.pages.filter((item) =>
      `${item.title} ${item.slug} ${item.navLabel}`.toLowerCase().includes(q),
    );
  }, [bundle.pages, query]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = Boolean(
        target?.closest("input, textarea, select, [contenteditable='true']"),
      );
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) history.forward();
        else history.back();
        return;
      }
      // Cmd/Ctrl+K opens StudioCommandPalette (handled there); keep 1/2/3 viewports.
      if (typing) return;
      if (event.key === "Escape") {
        if (shortcutsOpen) {
          setShortcutsOpen(false);
          return;
        }
        if (focusMode) {
          setFocusMode(false);
          return;
        }
        clearStudioSelection();
        dispatch({ type: "setUi", ui: { itemSelector: null } });
        setLeftOpen(false);
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && !meta) {
        const data = latest.current || studioPuck(page.draftData);
        const content = data.content || [];
        const ids = getStudioSelection();
        const targets =
          ids.length > 0
            ? content
                .map((node, index) => ({
                  index,
                  id:
                    typeof node.props?.id === "string" && node.props.id
                      ? node.props.id
                      : `idx-${index}`,
                  locked: isLayerLocked(node.props as Record<string, unknown>),
                }))
                .filter((row) => ids.includes(row.id) && !row.locked)
            : itemSelector && selectedItem
              ? isLayerLocked(selectedItem.props as Record<string, unknown>)
                ? []
                : [
                    {
                      index: itemSelector.index,
                      id: "",
                      locked: false,
                    },
                  ]
              : [];
        if (!targets.length) {
          if (ids.length || itemSelector) {
            setNotice("Unlock layers before deleting");
          }
          return;
        }
        event.preventDefault();
        for (const row of [...targets].sort((a, b) => b.index - a.index)) {
          dispatch({
            type: "remove",
            index: row.index,
            zone: itemSelector?.zone || "default-zone",
          });
        }
        clearStudioSelection();
        dispatch({ type: "setUi", ui: { itemSelector: null } });
        setNotice(
          `Deleted ${targets.length} layer${targets.length === 1 ? "" : "s"}`,
        );
        return;
      }
      if (event.key.toLowerCase() === "f" && !meta) {
        setFocusMode((v) => !v);
        return;
      }
      if (meta && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void persist(page.id, latest.current || studioPuck(page.draftData))
          .then(() => setNotice("Saved"))
          .catch((err) => setError(err.message));
        return;
      }
      if (meta && event.key.toLowerCase() === "p") {
        event.preventDefault();
        window.open(
          factoryDraftPath(bundle.project.slug, page.slug),
          "_blank",
          "noopener,noreferrer",
        );
        return;
      }
      if (event.key === "?" && !meta) {
        setShortcutsOpen(true);
        return;
      }
      if (event.key === "1") setViewport(1280);
      if (event.key === "2") setViewport(768);
      if (event.key === "3") setViewport(390);
      if (event.key === "+" || event.key === "=") {
        setZoom((z) => Math.min(150, z + 10));
      }
      if (event.key === "-") {
        setZoom((z) => Math.max(50, z - 10));
      }
      if (event.key === "0") setZoom(100);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    history,
    viewports,
    page.id,
    page.draftData,
    page.slug,
    bundle.project.slug,
    focusMode,
    shortcutsOpen,
    dispatch,
    selectedItem,
    itemSelector,
    persist,
    setNotice,
    setError,
    latest,
  ]);

  const studioCommands: StudioCommand[] = useMemo(
    () => [
      {
        id: "pages",
        label: "Open pages",
        hint: "Navigator",
        run: () => {
          setLeft("pages");
          setLeftOpen(true);
        },
      },
      {
        id: "assets",
        label: "Open assets",
        run: () => {
          setLeft("assets");
          setLeftOpen(true);
        },
      },
      {
        id: "import",
        label: "Import / scrape site",
        run: () => {
          setLeft("import");
          setLeftOpen(true);
        },
      },
      {
        id: "theme",
        label: "Edit theme tokens",
        run: () => setRight("theme"),
      },
      {
        id: "audit",
        label: "Health & history",
        run: () => {
          setRight("audit");
          void loadHealth().catch((err) => setError(err.message));
        },
      },
      {
        id: "focus",
        label: "Toggle focus mode",
        hint: "F",
        run: () => setFocusMode((v) => !v),
      },
      {
        id: "duplicate-page",
        label: "Duplicate current page",
        run: () => {
          void duplicateCurrent().catch((err) => setError(err.message));
        },
      },
      {
        id: "platform",
        label: "Open Platform portal",
        run: () => {
          window.location.href = "/admin/developer";
        },
      },
      {
        id: "connect",
        label: "Open Aevion Connect",
        run: () => {
          window.location.href = "/admin/developer/connect";
        },
      },
      {
        id: "hub",
        label: "Project hub",
        run: () => {
          window.location.href = `/admin/websites/${id}`;
        },
      },
      {
        id: "publish",
        label: "Publish live",
        run: () => {
          const note = window.prompt(
            "Name this version (optional)",
            `Version ${(bundle.versions[0]?.versionNumber ?? 0) + 1}`,
          );
          if (note === null) return;
          void publishLiveNamed(note).catch((err) => setError(err.message));
        },
      },
      {
        id: "export",
        label: "Export ZIP",
        run: () => {
          void exportZip().catch((err) => setError(err.message));
        },
      },
      {
        id: "ai",
        label: "Open AI panel",
        run: () => {
          setLeft("ai");
          setLeftOpen(true);
          requestAnimationFrame(() => commandRef.current?.focus());
        },
      },
      ...bundle.pages.map((item) => ({
        id: `page-${item.id}`,
        label: `Go to ${item.navLabel || item.title}`,
        hint: `/${item.slug}`,
        run: () => setPageId(item.id),
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bundle.pages, page.id, id],
  );

  function setViewport(nextWidth: number) {
    setDeviceWidth(nextWidth);
    setZoom(100);
    dispatch({
      type: "setUi",
      ui: {
        viewports: {
          current: { width: nextWidth, height: "auto" },
          controlsVisible: viewports?.controlsVisible ?? false,
          options:
            viewports?.options ??
            VIEWPORTS.map((item) => ({
              width: item.width,
              height: "auto" as const,
              label: item.label,
            })),
        },
      },
    });
    // Force the preview iframe to the device width so CSS media queries reflow.
    requestAnimationFrame(() => {
      const frame = document.querySelector<HTMLIFrameElement>(
        ".ae-canvas-site #preview-frame, .ae-canvas-site iframe[data-rfd-iframe], .ae-canvas-site iframe",
      );
      if (frame) {
        frame.style.width = `${nextWidth}px`;
        frame.setAttribute("width", String(nextWidth));
        window.dispatchEvent(new Event("resize"));
      }
    });
  }

  useEffect(() => {
    function onFocusField(event: Event) {
      const field = (event as CustomEvent<{ field?: string }>).detail?.field;
      if (!field) return;
      setRight("content");
      dispatch({
        type: "setUi",
        ui: {
          field: { focus: field },
          rightSideBarVisible: true,
        },
      });
    }
    window.addEventListener("ae-focus-field", onFocusField);
    return () => window.removeEventListener("ae-focus-field", onFocusField);
  }, [dispatch]);

  function applyStylePreset(patch: Record<string, string>) {
    if (!selectedItem || !itemSelector) {
      setNotice("Select a block first, then use a layout preset");
      return;
    }
    const currentStyles =
      ((selectedItem.props as { styles?: StyleBox })?.styles as StyleBox) || {};
    const bp = breakpointFromWidth(deviceWidth);
    const nextStyles = patchStylesAtBreakpoint(
      currentStyles,
      bp,
      patchStyleWithThemeRefs(patch),
    );
    dispatch({
      type: "replace",
      destinationIndex: itemSelector.index,
      destinationZone: itemSelector.zone || "default-zone",
      data: {
        ...selectedItem,
        props: {
          ...selectedItem.props,
          styles: nextStyles,
        },
      },
    });
    setNotice(
      bp === "desktop"
        ? "Style updated"
        : `${bp[0]!.toUpperCase()}${bp.slice(1)} override saved`,
    );
  }

  function replaceStyles(nextStyles: StyleBox) {
    if (!selectedItem || !itemSelector) {
      setNotice("Select a block first");
      return;
    }
    dispatch({
      type: "replace",
      destinationIndex: itemSelector.index,
      destinationZone: itemSelector.zone || "default-zone",
      data: {
        ...selectedItem,
        props: {
          ...selectedItem.props,
          styles: nextStyles,
        },
      },
    });
  }

  function replaceSelectedProps(nextProps: Record<string, unknown>) {
    if (!selectedItem || !itemSelector) {
      setNotice("Select a block first");
      return;
    }
    dispatch({
      type: "replace",
      destinationIndex: itemSelector.index,
      destinationZone: itemSelector.zone || "default-zone",
      data: {
        ...selectedItem,
        props: {
          ...selectedItem.props,
          ...nextProps,
          id: String(nextProps.id ?? selectedItem.props.id ?? ""),
        },
      },
    });
    setNotice("Instance updated");
  }

  function setStyleBreakpoint(bp: StudioBreakpoint) {
    const width = bp === "mobile" ? 390 : bp === "tablet" ? 768 : 1280;
    setViewport(width);
  }

  function persistTheme(theme: ThemeTokens) {
    setBundle({
      ...bundle,
      project: { ...bundle.project, theme },
    });
    void fetch(`/api/admin/websites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Theme save failed");
        }
        setNotice("Theme saved");
      })
      .catch((err) => setError(err.message));
  }

  function persistSiteConfig(siteConfig: SiteConfig) {
    setBundle({
      ...bundle,
      project: { ...bundle.project, siteConfig },
    });
    void fetch(`/api/admin/websites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteConfig }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Collections save failed");
        }
        setNotice("Collections saved");
      })
      .catch((err) => setError(err.message));
  }

  function runStudioTool(tool: StudioTool) {
    const zone = itemSelector?.zone || "default-zone";
    const index = itemSelector?.index ?? 0;
    const data = latest.current || studioPuck(page.draftData);

    switch (tool.action) {
      case "undo":
        history.back();
        break;
      case "redo":
        history.forward();
        break;
      case "duplicate":
        if (!itemSelector) return setNotice("Select a block first");
        dispatch({
          type: "duplicate",
          sourceIndex: index,
          sourceZone: zone,
        });
        setNotice("Duplicated");
        break;
      case "delete":
        if (!itemSelector) return setNotice("Select a block first");
        dispatch({ type: "remove", index, zone });
        setNotice("Deleted");
        break;
      case "cut":
        if (!selectedItem || !itemSelector) return setNotice("Select a block");
        blockClipboard = {
          type: selectedItem.type as string,
          props: { ...(selectedItem.props as Record<string, unknown>) },
        };
        dispatch({ type: "remove", index, zone });
        setNotice("Cut");
        break;
      case "copy":
        if (!selectedItem) return setNotice("Select a block");
        blockClipboard = {
          type: selectedItem.type as string,
          props: { ...(selectedItem.props as Record<string, unknown>) },
        };
        setNotice("Copied");
        break;
      case "paste": {
        if (!blockClipboard) return setNotice("Clipboard empty");
        const dest = data.content?.length || 0;
        dispatch({
          type: "insert",
          componentType: blockClipboard.type,
          destinationIndex: itemSelector ? index + 1 : dest,
          destinationZone: zone,
        });
        setNotice(`Pasted ${blockClipboard.type}`);
        break;
      }
      case "select-parent": {
        const id =
          selectedItem && typeof selectedItem.props?.id === "string"
            ? (selectedItem.props.id as string)
            : null;
        if (!id) return setNotice("Select a block");
        const parent = getParentById(id);
        const parentId =
          parent && typeof parent.props?.id === "string"
            ? (parent.props.id as string)
            : null;
        if (!parentId) return setNotice("No parent");
        const selector = getSelectorForId(parentId);
        if (selector)
          dispatch({ type: "setUi", ui: { itemSelector: selector } });
        break;
      }
      case "select-none":
        dispatch({ type: "setUi", ui: { itemSelector: null } });
        clearStudioSelection();
        break;
      case "toggle-lock":
        if (!selectedItem || !itemSelector) return setNotice("Select a block");
        dispatch({
          type: "replace",
          destinationIndex: index,
          destinationZone: zone,
          data: {
            ...selectedItem,
            props: {
              ...selectedItem.props,
              [STUDIO_PROP.locked]: !isLayerLocked(
                selectedItem.props as Record<string, unknown>,
              ),
            },
          },
        });
        setNotice("Lock toggled");
        break;
      case "toggle-hide":
        if (!selectedItem || !itemSelector) return setNotice("Select a block");
        {
          const hidden = !Boolean(
            (selectedItem.props as { _hidden?: boolean })._hidden,
          );
          dispatch({
            type: "replace",
            destinationIndex: index,
            destinationZone: zone,
            data: {
              ...selectedItem,
              props: {
                ...selectedItem.props,
                [STUDIO_PROP.hidden]: hidden,
              },
            },
          });
          setNotice(hidden ? "Hidden" : "Shown");
        }
        break;
      case "focus-content":
        setRight("content");
        break;
      case "insert": {
        const type = tool.payload?.type;
        if (!type) return;
        dispatch({
          type: "insert",
          componentType: type,
          destinationIndex: data.content?.length || 0,
          destinationZone: "default-zone",
        });
        setNotice(`Inserted ${type}`);
        setLeft("add");
        break;
      }
      case "style":
        if (tool.payload) applyStylePreset({ ...tool.payload });
        break;
      case "copy-styles":
        setStyleClipboard({
          ...(resolveStyleBox(
            (selectedItem?.props as { styles?: StyleBox })?.styles,
            breakpointFromWidth(deviceWidth),
          ) as Record<string, string>),
        });
        setNotice("Styles copied");
        break;
      case "paste-styles": {
        const clip = getStyleClipboard();
        if (!clip) return setNotice("No styles on clipboard");
        applyStylePreset(clip);
        break;
      }
      case "viewport":
        if (tool.payload?.width) setViewport(Number(tool.payload.width));
        break;
      case "zoom":
        if (tool.payload?.value) setZoom(Number(tool.payload.value));
        else if (tool.payload?.delta)
          setZoom((z) =>
            Math.max(40, Math.min(150, z + Number(tool.payload!.delta))),
          );
        break;
      case "open-tab":
        if (tool.payload?.tab) toggleLeft(tool.payload.tab as LeftTab);
        break;
      case "right-tab":
        if (tool.payload?.tab) setRight(tool.payload.tab as RightTab);
        break;
      case "export-html": {
        const html = [
          "<!doctype html><html><head><meta charset='utf-8'><title>",
          page.title,
          "</title></head><body data-aevion-export='1'>",
          `<!-- ${page.slug} · ${data.content?.length || 0} blocks -->`,
          "</body></html>",
        ].join("");
        void navigator.clipboard.writeText(html);
        setNotice("HTML stub copied");
        break;
      }
      case "export-json":
        void navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setNotice("Page JSON copied");
        break;
      case "export-css": {
        const theme = bundle.project.theme || {};
        const css = Object.entries(theme)
          .map(([k, v]) => `  --wf-${k}: ${v};`)
          .join("\n");
        void navigator.clipboard.writeText(`:root {\n${css}\n}`);
        setNotice("Theme CSS copied");
        break;
      }
      case "ai-prompt":
        setCommand(tool.payload?.prompt || "");
        toggleLeft("ai");
        setNotice("AI prompt ready");
        break;
      case "toggle-focus":
        setFocusMode((v) => !v);
        break;
      case "preview":
        window.open(factoryPreviewPath(bundle.project.slug), "_blank");
        break;
      case "draft":
        window.open(factoryDraftPath(bundle.project.slug, page.slug), "_blank");
        break;
      case "refresh-frame": {
        const frame = document.querySelector<HTMLIFrameElement>(
          ".ae-canvas-site iframe",
        );
        if (frame) {
          frame.style.height = "";
          window.dispatchEvent(new Event("resize"));
        }
        setNotice("Frame refreshed");
        break;
      }
      case "save":
        void persist(page.id, data)
          .then(() => setNotice("Saved"))
          .catch((err) => setError(err.message));
        break;
      case "notice":
        setNotice(tool.payload?.message || tool.label);
        break;
      default:
        setNotice(tool.label);
    }
  }

  function toggleLeft(tab: LeftTab) {
    if (left === tab && leftOpen) {
      setLeftOpen(false);
      return;
    }
    setLeft(tab);
    setLeftOpen(true);
  }

  async function post(
    path: string,
    body?: unknown,
  ): Promise<Record<string, any>> {
    const res = await fetch(path, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: Record<string, any> = {};
    try {
      json = text ? (JSON.parse(text) as Record<string, any>) : {};
    } catch {
      json = {};
    }
    if (!res.ok) {
      const message =
        (typeof json.error === "string" && json.error) ||
        (text && !text.startsWith("<") ? text.slice(0, 180) : "") ||
        `Request failed (${res.status})`;
      throw new Error(message);
    }
    return json;
  }

  async function exportZip() {
    const res = await fetch(`/api/admin/websites/${id}/export`);
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bundle.project.slug}-website.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice("ZIP downloaded.");
  }

  async function addPage() {
    const title = window.prompt("Page title", "New page");
    if (!title?.trim()) return;
    const json = await post(`/api/admin/websites/${id}/pages`, {
      title: title.trim(),
    });
    setBundle((current) =>
      current ? { ...current, pages: [...current.pages, json.page] } : current,
    );
    setPageId(json.page.id);
  }

  async function duplicateCurrent() {
    const json = await post(
      `/api/admin/websites/${id}/pages/${page.id}/duplicate`,
    );
    setBundle((current) =>
      current ? { ...current, pages: [...current.pages, json.page] } : current,
    );
    setPageId(json.page.id);
  }

  async function renameCurrent() {
    const title = window.prompt("Rename page", page.title);
    if (!title?.trim()) return;
    await patchPageMeta({ title: title.trim(), navLabel: title.trim() });
  }

  async function patchPageMeta(patch: {
    title?: string;
    slug?: string;
    navLabel?: string;
    showInNav?: boolean;
  }) {
    const res = await fetch(`/api/admin/websites/${id}/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Update failed");
    setBundle((current) =>
      current
        ? {
            ...current,
            pages: current.pages.map((item) =>
              item.id === page.id ? { ...item, ...patch } : item,
            ),
          }
        : current,
    );
    if (patch.slug === NOT_FOUND_PAGE_SLUG) {
      const current = latest.current || studioPuck(page.draftData);
      const next = patchPageSeo(current, { noIndex: true });
      latest.current = next;
      void persist(page.id, next).catch((err) => setError(err.message));
    }
  }

  async function ensureNotFoundPage() {
    const existing = bundle.pages.find((item) => isNotFoundPageSlug(item.slug));
    if (existing) {
      setPageId(existing.id);
      setNotice("404 page already exists");
      return;
    }
    const json = await post(`/api/admin/websites/${id}/pages`, {
      title: "Page not found",
      slug: NOT_FOUND_PAGE_SLUG,
      showInNav: false,
    });
    const created = json.page as WebsitePage;
    const seeded = patchPageSeo(studioPuck(created.draftData), {
      title: `Page not found · ${bundle.project.name}`,
      description: "That URL is not on this site.",
      noIndex: true,
    });
    await persist(created.id, seeded);
    setBundle((current) =>
      current
        ? {
            ...current,
            pages: [
              ...current.pages,
              { ...created, draftData: seeded, showInNav: false },
            ],
          }
        : current,
    );
    setPageId(created.id);
    setNotice("404 page created");
  }

  async function reloadBundle() {
    const res = await fetch(`/api/admin/websites/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Reload failed");
    setBundle(data);
    return data as ProjectBundle;
  }

  async function publishLiveNamed(note?: string) {
    await persist(page.id, latest.current || studioPuck(page.draftData));
    const json = await post(`/api/admin/websites/${id}/publish`, {
      ...(note?.trim() ? { note: note.trim() } : {}),
    });
    await reloadBundle();
    setNotice(
      json.note
        ? `Published “${json.note}” · ${json.url || ""}`
        : String(json.url || "Published"),
    );
    setRight("history");
  }

  async function restoreVersionFromHistory(version: WebsiteVersion) {
    setBusy("restore");
    try {
      await post(`/api/admin/websites/${id}/restore`, {
        versionId: version.id,
      });
      await reloadBundle();
      setNotice(
        `Restored “${displayVersionName(version)}” into draft. Live unchanged.`,
      );
    } finally {
      setBusy("");
    }
  }

  async function renameVersionFromHistory(
    version: WebsiteVersion,
    note: string,
  ) {
    const res = await fetch(
      `/api/admin/websites/${id}/versions/${version.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      },
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Rename failed");
    setBundle((current) =>
      current
        ? {
            ...current,
            versions: current.versions.map((item) =>
              item.id === version.id
                ? { ...item, note: json.note || note }
                : item,
            ),
          }
        : current,
    );
    setNotice(`Renamed to “${json.note || note}”`);
  }

  async function deleteCurrent() {
    if (!window.confirm(`Delete ${page.title}?`)) return;
    const res = await fetch(`/api/admin/websites/${id}/pages/${page.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "Delete failed");
    }
    const next = bundle.pages.filter((item) => item.id !== page.id);
    setBundle((current) => (current ? { ...current, pages: next } : current));
    setPageId(next[0]?.id ?? "");
  }

  async function runAi() {
    setBusy("ai");
    setError("");
    try {
      const json = await post(`/api/admin/websites/${id}/ai`, {
        prompt: command,
        pageId: page.id,
        apply: false,
      });
      const nextPlan = (json.plan || null) as AiPlan | null;
      const analysis = nextPlan ? analyzeAiPlan(nextPlan) : null;
      setPlan(analysis?.plan || nextPlan);
      setPlanConfirmMessage(analysis?.confirmMessage || null);
      setNotice(analysis?.plan.explanation || nextPlan?.explanation || "");
      setLeft("ai");
      setLeftOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI failed");
    } finally {
      setBusy("");
    }
  }

  async function applyAi() {
    if (!plan) return;
    const analysis = analyzeAiPlan(plan);
    if (analysis.destructive) {
      const message =
        analysis.confirmMessage ||
        planConfirmMessage ||
        "This plan is destructive. Apply anyway?";
      if (!window.confirm(message)) return;
    }
    setBusy("ai");
    try {
      const json = await post(`/api/admin/websites/${id}/ai`, {
        prompt: command,
        pageId: page.id,
        apply: true,
        confirmDestructive: analysis.destructive,
        plan: analysis.plan,
      });
      if (json.bundle) setBundle(json.bundle);
      setPlan(null);
      setPlanConfirmMessage(null);
      setNotice("Applied. Undo with ⌘Z if needed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apply failed");
    } finally {
      setBusy("");
    }
  }

  async function loadCmsImports() {
    try {
      const res = await fetch(
        `/api/admin/websites/${id}/cms?projectId=${encodeURIComponent(id)}`,
      );
      const json = await res.json();
      if (!res.ok) return;
      setCmsImports(json.imports || []);
    } catch {
      /* ignore */
    }
  }

  async function loadHealth() {
    const res = await fetch(`/api/admin/websites/${id}/health`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Health failed");
    setHealth(json);
  }

  async function analyseUrl(url = scrapeUrl) {
    scrapeAbortRef.current?.abort();
    const abort = new AbortController();
    scrapeAbortRef.current = abort;

    setBusy("scrape");
    setError("");
    setScrapeStep("Starting scrape…");
    setScrapeProgress(5);
    setLeft("import");
    setLeftOpen(true);

    try {
      // Sync scrape — waits for completion in one request (avoids killed background jobs).
      const created = await post("/api/admin/websites/intelligence", {
        url,
        projectId: id,
        sync: true,
      });
      if (abort.signal.aborted) return;

      let job = created.job as {
        id: string;
        status: string;
        step?: string;
        pages?: number;
        assets?: number;
        error?: string;
        result?: IntelligenceResult | null;
      };

      // If the server returned async (older clients / fallback), poll to completion.
      if (job.status !== "succeeded" && job.status !== "failed") {
        for (let i = 0; i < 120; i += 1) {
          if (abort.signal.aborted) return;
          if (job.status === "succeeded" || job.status === "failed") break;

          await new Promise((resolve) => setTimeout(resolve, 600));
          if (abort.signal.aborted) return;

          const res = await fetch(
            `/api/admin/websites/intelligence/${job.id}`,
            {
              signal: abort.signal,
            },
          );
          const text = await res.text();
          const json = text ? JSON.parse(text) : {};
          if (!res.ok)
            throw new Error(json.error || `Poll failed (${res.status})`);
          job = json.job;
          setScrapeStep(job.step || job.status);
          const pages = job.pages || 0;
          setScrapeProgress(Math.min(92, 12 + pages * 14));
        }
      }

      if (abort.signal.aborted) return;
      if (job.status === "failed") {
        throw new Error(job.error || "Import failed");
      }
      if (job.status !== "succeeded" || !job.result) {
        throw new Error("Import timed out — try again");
      }

      setScrape(job.result);
      setScrapeProgress(100);
      setScrapeStep("Ready for review · saved to CMS");
      setNotice(
        `Found ${job.result.pages.length} pages · ${job.result.images.length} assets`,
      );
      void loadCmsImports();
    } catch (err) {
      if (abort.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Import failed");
      setScrapeStep("");
      setScrapeProgress(0);
    } finally {
      if (scrapeAbortRef.current === abort) {
        scrapeAbortRef.current = null;
        setBusy("");
      }
    }
  }

  function cancelScrape() {
    scrapeAbortRef.current?.abort();
    scrapeAbortRef.current = null;
    setBusy("");
    setScrapeStep("Cancelled");
    setScrapeProgress(0);
  }

  function toggleScrapeInclude(
    collection: "pages" | "images" | "services" | "reviews",
    index: number,
  ) {
    setScrape((current) => {
      if (!current) return current;
      const next = { ...current, [collection]: [...current[collection]] };
      const item = { ...next[collection][index] };
      item.include = !item.include;
      next[collection][index] = item as never;
      return next;
    });
  }

  async function applyScrape(rebuild = true) {
    if (!scrape) return;
    setBusy("apply");
    setError("");
    try {
      const json = await post("/api/admin/websites/intelligence/apply", {
        projectId: id,
        result: scrape,
        rebuildPages: rebuild,
        applyBrandColors: applyColors,
        fields: applyFields,
        cmsImportId: cmsImportId || undefined,
      });
      if (json.bundle) setBundle(json.bundle as typeof bundle);
      setNotice(
        rebuild
          ? "Import applied and pages rebuilt · saved in CMS"
          : "Business data updated from import · saved in CMS",
      );
      void loadCmsImports();
      setLeft("assets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apply failed");
    } finally {
      setBusy("");
    }
  }

  async function runFindReplace() {
    setBusy("replace");
    setError("");
    try {
      const json = await post(`/api/admin/websites/${id}/replace`, {
        find: findText,
        replace: replaceText,
        rebuildPages: true,
      });
      if (json.bundle) setBundle(json.bundle as typeof bundle);
      setNotice(`Replaced “${findText}” across site copy`);
      setFindText("");
      setReplaceText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Replace failed");
    } finally {
      setBusy("");
    }
  }

  async function rebuildSite() {
    setBusy("rebuild");
    setError("");
    try {
      const json = await post(`/api/admin/websites/${id}/generate`);
      // generate route returns the bundle directly
      if (json?.project) setBundle(json as typeof bundle);
      else if (json?.bundle) setBundle(json.bundle as typeof bundle);
      setNotice("Pages rebuilt from business data");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rebuild failed");
    } finally {
      setBusy("");
    }
  }

  async function assignAsset(
    action: "hero" | "logo" | "favicon" | "gallery" | "service",
    url: string,
    alt = "",
  ) {
    setBusy(`asset-${action}`);
    setError("");
    try {
      const json = await post(`/api/admin/websites/${id}/assets`, {
        action,
        url,
        alt,
        rebuild: true,
      });
      if (json.bundle) setBundle(json.bundle as typeof bundle);
      setNotice(`Set as ${action}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Asset update failed");
    } finally {
      setBusy("");
    }
  }

  async function loadMcpTools() {
    try {
      const res = await fetch("/api/admin/websites/mcp");
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok)
        throw new Error(json.error || `MCP unavailable (${res.status})`);
      setMcpTools(json.tools || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "MCP unavailable");
    }
  }

  const organisedAssets = useMemo(() => {
    const fromScrape =
      scrape?.images.map((item, index) => ({
        key: `scrape-${index}`,
        url: item.url,
        alt: item.alt || item.kind,
        kind: item.kind,
        source: "import" as const,
        include: item.include,
        index,
      })) ?? [];
    const fromBusiness = [
      bundle.business.logoUrl
        ? {
            key: "logo",
            url: bundle.business.logoUrl,
            alt: "Logo",
            kind: "logo",
            source: "site" as const,
            include: true,
            index: -1,
          }
        : null,
      bundle.business.heroUrl
        ? {
            key: "hero",
            url: bundle.business.heroUrl,
            alt: "Hero",
            kind: "hero",
            source: "site" as const,
            include: true,
            index: -1,
          }
        : null,
      ...bundle.business.media.map((item) => ({
        key: item.id,
        url: item.url,
        alt: item.alt || item.kind,
        kind: item.kind,
        source: "site" as const,
        include: true,
        index: -1,
      })),
    ].filter(Boolean) as Array<{
      key: string;
      url: string;
      alt: string;
      kind: string;
      source: "import" | "site";
      include: boolean;
      index: number;
    }>;
    const seen = new Set<string>();
    return [...fromScrape, ...fromBusiness].filter((item) => {
      if (!item.url || seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
  }, [bundle.business, scrape]);

  const deferredAssetQuery = useDeferredValue(assetQuery);

  const filteredAssets = useMemo(() => {
    const q = deferredAssetQuery.trim().toLowerCase();
    return organisedAssets.filter((item) => {
      if (assetKind !== "all" && item.kind !== assetKind) return false;
      if (!q) return true;
      return `${item.alt} ${item.kind} ${item.url}`.toLowerCase().includes(q);
    });
  }, [organisedAssets, deferredAssetQuery, assetKind]);

  const selectedLabel =
    (selectedItem?.type as string | undefined) || page.title || "Body";

  return (
    <div
      className={`aevion-studio${leftOpen ? " is-left-open" : ""}${focusMode ? " is-focus" : ""}`}
    >
      <StudioCommandPalette commands={studioCommands} />
      {(notice || error) && (
        <div className={`ae-toast${error ? " is-error" : ""}`} role="status">
          {error || notice}
        </div>
      )}
      <header className="ae-top">
        <div className="ae-brand">
          <a
            className="ae-mark"
            href={`/admin/websites/${id}`}
            title="Project hub"
            style={{ textDecoration: "none" }}
          >
            Ae
          </a>
          <div className="ae-crumb">
            <a
              className="ae-crumb-name"
              href={`/admin/websites/${id}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {bundle.project.name}
            </a>
            <ChevronDown size={12} className="ae-crumb-sep" />
            <select
              className="ae-page-select"
              value={page.id}
              onChange={(event) => setPageId(event.target.value)}
              aria-label="Current page"
            >
              {bundle.pages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.navLabel || item.title}
                </option>
              ))}
            </select>
          </div>
          <span
            className={`ae-status-chip${bundle.project.status === "published" ? " is-live" : ""}`}
          >
            {bundle.project.status || "draft"}
          </span>
          <span
            className={`ae-save${saveState === "saving" ? " is-saving" : ""}${saveState === "failed" ? " is-failed" : ""}`}
          >
            <span className="ae-save-dot" />
            {saveState === "saving"
              ? "Saving"
              : saveState === "failed"
                ? "Save failed"
                : "Saved"}
          </span>
        </div>

        <div className="ae-devices" role="group" aria-label="Breakpoints">
          {VIEWPORTS.map((item) => (
            <button
              key={item.id}
              type="button"
              title={`${item.label} (${item.width}px)`}
              className={`ae-icon-btn${width === item.width ? " is-on" : ""}`}
              onClick={() => setViewport(item.width)}
            >
              <item.Icon />
            </button>
          ))}
        </div>

        <div className="ae-top-actions">
          <button
            type="button"
            className="ae-icon-btn"
            title="Undo"
            disabled={!history.hasPast}
            onClick={() => history.back()}
          >
            <Undo2 />
          </button>
          <button
            type="button"
            className="ae-icon-btn"
            title="Redo"
            disabled={!history.hasFuture}
            onClick={() => history.forward()}
          >
            <Redo2 />
          </button>
          <button
            type="button"
            className="ae-icon-btn"
            title="Zoom out"
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
          >
            −
          </button>
          <span className="ae-zoom-label">{zoom}%</span>
          <button
            type="button"
            className="ae-icon-btn"
            title="Zoom in"
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
          >
            +
          </button>
          <button
            type="button"
            className="ae-icon-btn"
            title="Fit width to canvas"
            onClick={() => {
              const available = Math.max(
                (canvasRef.current?.clientWidth || 800) - 48,
                280,
              );
              const next = Math.max(
                40,
                Math.min(150, Math.floor((available / width) * 100)),
              );
              setZoom(next);
            }}
          >
            <Maximize2 size={14} />
          </button>
          <button
            type="button"
            className={`ae-icon-btn${focusMode ? " is-on" : ""}`}
            title="Focus mode (F)"
            onClick={() => setFocusMode((v) => !v)}
          >
            <Focus size={14} />
          </button>
          <button
            type="button"
            className="ae-icon-btn"
            title="Duplicate page"
            onClick={() =>
              void duplicateCurrent().catch((err) => setError(err.message))
            }
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            className="ae-icon-btn"
            title="Shortcuts"
            onClick={() => setShortcutsOpen(true)}
          >
            <HelpCircle size={14} />
          </button>
          <a
            className="ae-btn ghost"
            href={factoryDraftPath(bundle.project.slug, page.slug)}
            target="_blank"
            rel="noreferrer"
          >
            <Eye size={14} />
            Preview
          </a>
          <button
            type="button"
            className="ae-btn ghost"
            onClick={() =>
              void exportZip().catch((err) => setError(err.message))
            }
          >
            <Download size={14} />
            Export
          </button>
          <button
            type="button"
            className="ae-btn ghost"
            onClick={() => {
              setLeft("deploy");
              setLeftOpen(true);
              setFocusMode(false);
            }}
          >
            <Globe size={14} />
            Deploy
          </button>
          <a
            className="ae-btn ghost"
            href={`/admin/websites/${id}`}
            title="Hub"
          >
            <Home size={14} />
            Hub
          </a>
          <a className="ae-btn ghost" href="/admin/developer" title="Platform">
            <Link2 size={14} />
            Platform
          </a>
          <a
            className="ae-btn ghost"
            href="/admin/developer/connect"
            title="Connect"
          >
            <Cable size={14} />
            Connect
          </a>
          <button
            type="button"
            className="ae-btn primary"
            onClick={() => {
              const note = window.prompt(
                "Name this version (optional)",
                `Version ${(bundle.versions[0]?.versionNumber ?? 0) + 1}`,
              );
              if (note === null) return;
              void publishLiveNamed(note).catch((err) => setError(err.message));
            }}
          >
            <Upload size={14} />
            Publish
          </button>
        </div>
      </header>

      <div className="ae-body">
        <nav className="ae-rail" aria-label="Studio tools">
          <button
            type="button"
            className={`ae-rail-btn${leftOpen && left === "pages" ? " is-on" : ""}`}
            title="Pages"
            onClick={() => toggleLeft("pages")}
          >
            <FileStack />
          </button>
          <button
            type="button"
            className={`ae-rail-btn${leftOpen && left === "site" ? " is-on" : ""}`}
            title="Site details"
            onClick={() => toggleLeft("site")}
          >
            <Briefcase />
          </button>
          <button
            type="button"
            className={`ae-rail-btn${leftOpen && left === "add" ? " is-on" : ""}`}
            title="Add"
            onClick={() => toggleLeft("add")}
          >
            <Boxes />
          </button>
          <button
            type="button"
            className={`ae-rail-btn${leftOpen && left === "tools" ? " is-on" : ""}`}
            title="Builder tools (100)"
            onClick={() => toggleLeft("tools")}
          >
            <Wrench />
          </button>
          <button
            type="button"
            className={`ae-rail-btn${leftOpen && left === "layers" ? " is-on" : ""}`}
            title="Navigator"
            onClick={() => toggleLeft("layers")}
          >
            <Layers />
          </button>
          <button
            type="button"
            className={`ae-rail-btn${leftOpen && left === "assets" ? " is-on" : ""}`}
            title="Assets"
            onClick={() => toggleLeft("assets")}
          >
            <ImageIcon />
          </button>
          <button
            type="button"
            className={`ae-rail-btn${leftOpen && left === "import" ? " is-on" : ""}`}
            title="Import website"
            onClick={() => toggleLeft("import")}
          >
            <Upload />
          </button>
          <button
            type="button"
            className={`ae-rail-btn${leftOpen && left === "cms" ? " is-on" : ""}`}
            title="Scraped CMS"
            onClick={() => {
              toggleLeft("cms");
              void loadCmsImports();
            }}
          >
            <Archive />
          </button>
          <button
            type="button"
            className={`ae-rail-btn${leftOpen && left === "ai" ? " is-on" : ""}`}
            title="AI"
            onClick={() => toggleLeft("ai")}
          >
            <Sparkles />
          </button>
          <button
            type="button"
            className={`ae-rail-btn${leftOpen && left === "api" ? " is-on" : ""}`}
            title="API & MCP"
            onClick={() => {
              toggleLeft("api");
              if (!mcpTools.length) void loadMcpTools();
            }}
          >
            <Cable />
          </button>
          <div className="ae-rail-space" />
          <button
            type="button"
            className={`ae-rail-btn${leftOpen && left === "deploy" ? " is-on" : ""}`}
            title="Deploy & domains"
            onClick={() => {
              toggleLeft("deploy");
              void fetch(`/api/admin/websites/${id}/deploy`)
                .then((res) => res.json())
                .then((data) =>
                  setDeployStatus({
                    configured: Boolean(data.configured),
                    message: data.message || "",
                  }),
                )
                .catch(() => null);
            }}
          >
            <Globe size={17} />
          </button>
        </nav>

        {leftOpen ? (
          <aside className="ae-left">
            <div className="ae-panel-head">
              {left === "pages"
                ? "Pages"
                : left === "site"
                  ? "Site"
                  : left === "add"
                    ? "Add"
                    : left === "tools"
                      ? "Tools"
                      : left === "layers"
                        ? "Navigator"
                        : left === "assets"
                          ? "Assets"
                          : left === "import"
                            ? "Import"
                            : left === "cms"
                              ? "CMS"
                              : left === "api"
                                ? "API & MCP"
                                : left === "deploy"
                                  ? "Deploy"
                                  : "AI"}
            </div>
            {left === "tools" ? (
              <div className="ae-panel-scroll ae-pane">
                <StudioToolsPanel onRun={runStudioTool} />
              </div>
            ) : null}
            {left === "site" ? (
              <StudioBusinessPanel
                bundle={bundle}
                onSaved={(next) => {
                  setBundle(next);
                  setNotice("Site details saved");
                }}
              />
            ) : null}
            {left === "pages" ? (
              <div className="ae-panel-scroll">
                <input
                  className="ae-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search pages"
                />
                <ul className="ae-list">
                  {pages.map((item, index) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={item.id === page.id ? "is-on" : ""}
                        onClick={() => setPageId(item.id)}
                      >
                        <span className="ae-page-copy">
                          <span>{item.navLabel || item.title}</span>
                          <small>
                            {index === 0 ? "Home · " : ""}
                            {isNotFoundPageSlug(item.slug) ? "404 · " : ""}
                            {item.showInNav ? "" : "Hidden · "}/{item.slug}
                          </small>
                        </span>
                      </button>
                      <div className="ae-page-meta-row">
                        <button
                          type="button"
                          className="ae-btn ghost"
                          title="Move up"
                          disabled={index === 0}
                          onClick={() =>
                            void (async () => {
                              const ids = bundle.pages.map((p) => p.id);
                              if (index <= 0) return;
                              [ids[index - 1], ids[index]] = [
                                ids[index],
                                ids[index - 1],
                              ];
                              await post(
                                `/api/admin/websites/${id}/pages/reorder`,
                                { pageIds: ids },
                              );
                              const res = await fetch(
                                `/api/admin/websites/${id}`,
                              );
                              const data = await res.json();
                              if (res.ok) setBundle(data);
                            })().catch((err) => setError(err.message))
                          }
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="ae-btn ghost"
                          title="Move down"
                          disabled={index >= bundle.pages.length - 1}
                          onClick={() =>
                            void (async () => {
                              const ids = bundle.pages.map((p) => p.id);
                              if (index >= ids.length - 1) return;
                              [ids[index], ids[index + 1]] = [
                                ids[index + 1],
                                ids[index],
                              ];
                              await post(
                                `/api/admin/websites/${id}/pages/reorder`,
                                { pageIds: ids },
                              );
                              const res = await fetch(
                                `/api/admin/websites/${id}`,
                              );
                              const data = await res.json();
                              if (res.ok) setBundle(data);
                            })().catch((err) => setError(err.message))
                          }
                        >
                          ↓
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="ae-actions-row">
                  <button
                    type="button"
                    className="ae-btn"
                    onClick={() =>
                      void addPage().catch((err) => setError(err.message))
                    }
                  >
                    New
                  </button>
                  <button
                    type="button"
                    className="ae-btn ghost"
                    onClick={() =>
                      void duplicateCurrent().catch((err) =>
                        setError(err.message),
                      )
                    }
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="ae-btn ghost"
                    onClick={() =>
                      void renameCurrent().catch((err) => setError(err.message))
                    }
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="ae-btn ghost"
                    onClick={() =>
                      void deleteCurrent().catch((err) => setError(err.message))
                    }
                  >
                    Delete
                  </button>
                </div>
                <div className="ae-actions-row">
                  <button
                    type="button"
                    className="ae-btn ghost"
                    disabled={isNotFoundPageSlug(page.slug)}
                    onClick={() =>
                      void patchPageMeta({
                        showInNav: !page.showInNav,
                      }).catch((err) => setError(err.message))
                    }
                  >
                    {page.showInNav ? "Hide from nav" : "Show in nav"}
                  </button>
                  <button
                    type="button"
                    className="ae-btn ghost"
                    disabled={
                      bundle.pages[0]?.id === page.id ||
                      isNotFoundPageSlug(page.slug)
                    }
                    onClick={() =>
                      void (async () => {
                        const ids = [
                          page.id,
                          ...bundle.pages
                            .map((p) => p.id)
                            .filter((pid) => pid !== page.id),
                        ];
                        await post(`/api/admin/websites/${id}/pages/reorder`, {
                          pageIds: ids,
                        });
                        const res = await fetch(`/api/admin/websites/${id}`);
                        const data = await res.json();
                        if (res.ok) setBundle(data);
                        setNotice("Set as homepage");
                      })().catch((err) => setError(err.message))
                    }
                  >
                    Set homepage
                  </button>
                  <button
                    type="button"
                    className="ae-btn ghost"
                    onClick={() =>
                      void ensureNotFoundPage().catch((err) =>
                        setError(err.message),
                      )
                    }
                  >
                    {bundle.pages.some((item) => isNotFoundPageSlug(item.slug))
                      ? "Open 404"
                      : "Add 404"}
                  </button>
                </div>
                <PageSettingsPanel
                  page={page}
                  draftData={latest.current || studioPuck(page.draftData)}
                  onMetaChange={(patch) =>
                    void patchPageMeta(patch).catch((err) =>
                      setError(err.message),
                    )
                  }
                  onDraftChange={(next) => {
                    latest.current = next;
                    void persist(page.id, next).catch((err) =>
                      setError(err.message),
                    );
                  }}
                />
                <RedirectsPanel
                  siteConfig={bundle.project.siteConfig}
                  onSiteConfigChange={persistSiteConfig}
                />
              </div>
            ) : null}
            {left === "add" ? (
              <div className="ae-panel-scroll ae-pane ae-add-panel">
                <input
                  className="ae-search ae-add-search"
                  value={blockQuery}
                  onChange={(e) => setBlockQuery(e.target.value)}
                  placeholder="Filter components…"
                />
                {blockQuery.trim() ? (
                  <ul className="ae-list">
                    {Object.keys(
                      (factoryConfig.components || {}) as Record<
                        string,
                        unknown
                      >,
                    )
                      .filter((name) =>
                        name
                          .toLowerCase()
                          .includes(blockQuery.trim().toLowerCase()),
                      )
                      .map((name) => (
                        <li key={name}>
                          <button
                            type="button"
                            onClick={() => {
                              const index =
                                (latest.current || studioPuck(page.draftData))
                                  .content?.length || 0;
                              dispatch({
                                type: "insert",
                                componentType: name,
                                destinationIndex: index,
                                destinationZone: "default-zone",
                              });
                              setNotice(`Added ${name}`);
                              setBlockQuery("");
                            }}
                          >
                            {name}
                          </button>
                        </li>
                      ))}
                  </ul>
                ) : null}
                <div
                  style={
                    blockQuery.trim()
                      ? {
                          filter: "none",
                        }
                      : undefined
                  }
                  data-ae-block-filter={blockQuery.trim().toLowerCase()}
                >
                  <Puck.Components />
                </div>
              </div>
            ) : null}
            {left === "layers" ? (
              <div className="ae-panel-scroll ae-pane">
                <StudioLayersPanel onNotice={setNotice} />
              </div>
            ) : null}
            {left === "assets" ? (
              <div className="ae-panel-scroll ae-pane ae-side-tools">
                <p className="ae-note">
                  Organised media from this site and imports. Upload new files
                  or assign to hero, logo, or gallery.
                </p>
                <input
                  ref={uploadRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="ae-hidden-file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    void (async () => {
                      setBusy("upload");
                      try {
                        const form = new FormData();
                        form.set("file", file);
                        form.set("owner", id);
                        const res = await fetch("/api/admin/uploads", {
                          method: "POST",
                          body: form,
                        });
                        const data = await res.json();
                        if (!res.ok)
                          throw new Error(data.error || "Upload failed");
                        await assignAsset(
                          "gallery",
                          String(data.url || ""),
                          file.name,
                        );
                        setNotice("Uploaded to gallery");
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : "Upload failed",
                        );
                      } finally {
                        setBusy("");
                      }
                    })();
                  }}
                />
                <div className="ae-actions-row" style={{ padding: "0 0 10px" }}>
                  <button
                    type="button"
                    className="ae-btn"
                    onClick={() => uploadRef.current?.click()}
                    disabled={Boolean(busy)}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    className="ae-btn ghost"
                    onClick={() => toggleLeft("import")}
                  >
                    Import site
                  </button>
                </div>
                <input
                  className="ae-search"
                  value={assetQuery}
                  onChange={(event) => setAssetQuery(event.target.value)}
                  placeholder="Search assets"
                />
                <select
                  className="ae-search"
                  value={assetKind}
                  onChange={(event) => setAssetKind(event.target.value)}
                >
                  <option value="all">All kinds</option>
                  <option value="logo">Logo</option>
                  <option value="hero">Hero</option>
                  <option value="gallery">Gallery</option>
                  <option value="service">Service</option>
                  <option value="favicon">Favicon</option>
                </select>
                {!filteredAssets.length ? (
                  <p className="ae-note">
                    No assets yet. Upload or import a website to organise
                    images.
                  </p>
                ) : (
                  <div className="ae-asset-grid">
                    {filteredAssets.map((item) => (
                      <article key={item.key} className="ae-asset-card">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.alt} loading="lazy" />
                        <div className="ae-asset-meta">
                          <strong>{item.kind}</strong>
                          <span>{item.source}</span>
                        </div>
                        <div className="ae-asset-actions">
                          <button
                            type="button"
                            onClick={() =>
                              void assignAsset("hero", item.url, item.alt)
                            }
                            disabled={Boolean(busy)}
                          >
                            Hero
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void assignAsset("logo", item.url, item.alt)
                            }
                            disabled={Boolean(busy)}
                          >
                            Logo
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void assignAsset("gallery", item.url, item.alt)
                            }
                            disabled={Boolean(busy)}
                          >
                            Gallery
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
            {left === "import" ? (
              <div className="ae-panel-scroll ae-pane ae-side-tools">
                <p className="ae-section-label">Open-source scrape</p>
                <p className="ae-note">
                  Engine: Readability + linkedom + JSON-LD. Runs to completion
                  in one request, then saves a full snapshot into the Scraped
                  CMS. Assets download when you apply.
                </p>
                <form
                  className="ae-side-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void analyseUrl();
                  }}
                >
                  <input
                    value={scrapeUrl}
                    onChange={(event) => setScrapeUrl(event.target.value)}
                    placeholder="https://example.com"
                    disabled={busy === "scrape"}
                  />
                  <div className="ae-actions-row" style={{ padding: 0 }}>
                    <button
                      type="submit"
                      className="ae-btn primary"
                      disabled={Boolean(busy)}
                    >
                      {busy === "scrape" ? "Scraping…" : "Scrape & organise"}
                    </button>
                    {busy === "scrape" ? (
                      <button
                        type="button"
                        className="ae-btn ghost"
                        onClick={cancelScrape}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </form>
                {busy === "scrape" || scrapeProgress > 0 ? (
                  <div className="ae-progress">
                    <div
                      className="ae-progress-bar"
                      style={{ width: `${scrapeProgress}%` }}
                    />
                  </div>
                ) : null}
                {scrapeStep || busy === "scrape" ? (
                  <p className="ae-note">{scrapeStep || "Working…"}</p>
                ) : null}

                {scrape ? (
                  <>
                    <p className="ae-section-label">Provenance</p>
                    <p className="ae-note">
                      Source {scrape.sourceUrl} · engine {scrape.engine}
                      {scrape.robotsAllowed === false
                        ? " · robots restricted"
                        : ""}
                    </p>
                    {scrape.provenance?.length ? (
                      <ul className="ae-review-list">
                        {scrape.provenance.slice(0, 8).map((item, index) => (
                          <li key={`${item.sourceUrl}-${index}`}>
                            <span className="ae-note">
                              {item.contentType} ·{" "}
                              {item.sourcePage || item.sourceUrl} ·{" "}
                              {new Date(item.importedAt).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="ae-section-label">Review</p>
                    <p className="ae-note">
                      {scrape.name}
                      {scrape.tagline
                        ? ` · ${scrape.tagline.slice(0, 80)}`
                        : ""}
                    </p>
                    <p className="ae-note">
                      {scrape.pages.filter((item) => item.include).length}/
                      {scrape.pages.length} pages ·{" "}
                      {scrape.images.filter((item) => item.include).length}/
                      {scrape.images.length} images ·{" "}
                      {scrape.services.filter((item) => item.include).length}{" "}
                      services · {scrape.engine}
                    </p>
                    {scrape.brandColors?.length ? (
                      <div className="ae-color-row">
                        {scrape.brandColors.map((color) => (
                          <span
                            key={color}
                            className="ae-color-dot"
                            style={{ background: color }}
                            title={color}
                          />
                        ))}
                        <label className="ae-check" style={{ marginLeft: 4 }}>
                          <input
                            type="checkbox"
                            checked={applyColors}
                            onChange={() => setApplyColors((v) => !v)}
                          />
                          Apply colours
                        </label>
                      </div>
                    ) : null}

                    <p className="ae-section-label">Apply fields</p>
                    <div className="ae-check-grid">
                      {(
                        Object.keys(applyFields) as Array<keyof ApplyFields>
                      ).map((key) => (
                        <label key={key} className="ae-check">
                          <input
                            type="checkbox"
                            checked={applyFields[key]}
                            onChange={() =>
                              setApplyFields((current) => ({
                                ...current,
                                [key]: !current[key],
                              }))
                            }
                          />
                          {key}
                        </label>
                      ))}
                    </div>

                    <p className="ae-section-label">Pages</p>
                    <ul className="ae-review-list">
                      {scrape.pages.map((item, index) => (
                        <li key={item.url}>
                          <label className="ae-check">
                            <input
                              type="checkbox"
                              checked={item.include}
                              onChange={() =>
                                toggleScrapeInclude("pages", index)
                              }
                            />
                            <span>
                              <strong>{item.type}</strong> {item.title}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>

                    <p className="ae-section-label">Images</p>
                    <ul className="ae-review-list">
                      {scrape.images.slice(0, 16).map((item, index) => (
                        <li key={`${item.url}-${index}`}>
                          <label className="ae-check">
                            <input
                              type="checkbox"
                              checked={item.include}
                              onChange={() =>
                                toggleScrapeInclude("images", index)
                              }
                            />
                            <span>
                              <strong>{item.kind}</strong>{" "}
                              {item.alt || item.url.slice(-28)}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>

                    <div
                      className="ae-actions-row"
                      style={{ padding: "8px 0" }}
                    >
                      <button
                        type="button"
                        className="ae-btn primary"
                        disabled={Boolean(busy)}
                        onClick={() => void applyScrape(true)}
                      >
                        {busy === "apply" ? "Applying…" : "Apply to site"}
                      </button>
                      <button
                        type="button"
                        className="ae-btn ghost"
                        disabled={Boolean(busy)}
                        onClick={() => void applyScrape(false)}
                      >
                        Data only
                      </button>
                    </div>
                  </>
                ) : null}

                <p className="ae-section-label">Find &amp; replace</p>
                <form
                  className="ae-side-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void runFindReplace();
                  }}
                >
                  <input
                    value={findText}
                    onChange={(event) => setFindText(event.target.value)}
                    placeholder="Find text"
                  />
                  <input
                    value={replaceText}
                    onChange={(event) => setReplaceText(event.target.value)}
                    placeholder="Replace with"
                  />
                  <button
                    type="submit"
                    className="ae-btn"
                    disabled={Boolean(busy) || !findText.trim()}
                  >
                    {busy === "replace" ? "Replacing…" : "Replace in site"}
                  </button>
                </form>

                <p className="ae-section-label">Rebuild</p>
                <button
                  type="button"
                  className="ae-btn ghost"
                  disabled={Boolean(busy)}
                  onClick={() => void rebuildSite()}
                >
                  {busy === "rebuild"
                    ? "Rebuilding…"
                    : "Rebuild pages from data"}
                </button>

                {notice ? <p className="ae-note">{notice}</p> : null}
                {error ? (
                  <p className="ae-note" style={{ color: "#f0a8a8" }}>
                    {error}
                  </p>
                ) : null}
              </div>
            ) : null}
            {left === "cms" ? (
              <div className="ae-panel-scroll ae-pane ae-side-tools">
                <CollectionsPanel
                  siteConfig={bundle.project.siteConfig}
                  business={bundle.business}
                  onSiteConfigChange={persistSiteConfig}
                />
                <hr className="ae-hr" />
                <p className="ae-section-label">Scraped content CMS</p>
                <p className="ae-note">
                  Every successful scrape is stored here with pages, media,
                  services, and provenance. Open one to re-apply without
                  scraping again.
                </p>
                <div className="ae-actions-row" style={{ padding: "0 0 10px" }}>
                  <button
                    type="button"
                    className="ae-btn"
                    onClick={() => void loadCmsImports()}
                  >
                    Refresh
                  </button>
                  <a
                    className="ae-btn ghost"
                    href={`/admin/websites/${id}/cms`}
                  >
                    Full CMS
                  </a>
                </div>
                {!cmsImports.length ? (
                  <p className="ae-note">
                    No imports yet. Run Import to scrape a site.
                  </p>
                ) : (
                  <ul className="ae-review-list">
                    {cmsImports.map((item) => (
                      <li key={item.id}>
                        <strong>{item.title}</strong>
                        <p className="ae-note">
                          {item.status} · {item.pageCount} pages ·{" "}
                          {item.assetCount} assets ·{" "}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                        <p className="ae-note">{item.summary}</p>
                        <div className="ae-actions-row" style={{ padding: 0 }}>
                          <button
                            type="button"
                            className="ae-btn"
                            disabled={Boolean(busy)}
                            onClick={() =>
                              void (async () => {
                                setBusy("cms");
                                try {
                                  const res = await fetch(
                                    `/api/admin/websites/${id}/cms?importId=${item.id}`,
                                  );
                                  const json = await res.json();
                                  if (!res.ok)
                                    throw new Error(
                                      json.error || "Load failed",
                                    );
                                  setScrape(json.import.result);
                                  setCmsImportId(item.id);
                                  setLeft("import");
                                  setNotice(`Loaded CMS import ${item.title}`);
                                } catch (err) {
                                  setError(
                                    err instanceof Error
                                      ? err.message
                                      : "Load failed",
                                  );
                                } finally {
                                  setBusy("");
                                }
                              })()
                            }
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            className="ae-btn ghost"
                            onClick={() =>
                              void fetch(
                                `/api/admin/websites/${id}/cms?importId=${item.id}`,
                                { method: "DELETE" },
                              ).then(() => loadCmsImports())
                            }
                          >
                            Archive
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
            {left === "ai" ? (
              <div className="ae-panel-scroll ae-pane ae-side-tools">
                <AiOpsPanel
                  command={command}
                  onCommandChange={setCommand}
                  commandRef={commandRef}
                  plan={plan}
                  confirmMessage={planConfirmMessage}
                  busy={busy === "ai"}
                  projectSlug={bundle.project.slug}
                  projectId={id}
                  versionCount={bundle.versions.length}
                  pageCount={bundle.pages.length}
                  mcpTools={mcpTools}
                  onPlan={() => void runAi()}
                  onApply={() => void applyAi()}
                  onReject={() => {
                    setPlan(null);
                    setPlanConfirmMessage(null);
                  }}
                />
                {notice ? <p className="ae-note">{notice}</p> : null}
                {error ? (
                  <p className="ae-note" style={{ color: "#f0a8a8" }}>
                    {error}
                  </p>
                ) : null}
              </div>
            ) : null}
            {left === "api" ? (
              <div className="ae-panel-scroll ae-pane ae-side-tools">
                <p className="ae-section-label">MCP endpoint</p>
                <code className="ae-code">POST /api/admin/websites/mcp</code>
                <p className="ae-note">
                  Body: {"{"} &quot;tool&quot;: &quot;scrapeWebsite&quot;,
                  &quot;arguments&quot;: {"{"} &quot;url&quot;,
                  &quot;projectId&quot; {"}"} {"}"}
                </p>
                <div className="ae-actions-row" style={{ padding: "0 0 10px" }}>
                  <button
                    type="button"
                    className="ae-btn"
                    onClick={() => void loadMcpTools()}
                  >
                    Refresh tools
                  </button>
                </div>
                <p className="ae-section-label">Tools</p>
                <ul className="ae-review-list">
                  {(mcpTools.length
                    ? mcpTools
                    : [
                        {
                          name: "scrapeWebsite",
                          description: "Start OSS scrape",
                        },
                        {
                          name: "applyScrape",
                          description: "Apply scrape to project",
                        },
                        {
                          name: "getWebsite",
                          description: "Load project bundle",
                        },
                      ]
                  ).map((tool) => (
                    <li key={tool.name}>
                      <p className="ae-note" style={{ margin: 0 }}>
                        <strong>{tool.name}</strong>
                        <br />
                        {tool.description}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="ae-section-label">REST</p>
                <ul className="ae-review-list">
                  <li>
                    <code className="ae-code">
                      POST /api/admin/websites/intelligence
                    </code>
                  </li>
                  <li>
                    <code className="ae-code">
                      POST /api/admin/websites/intelligence/apply
                    </code>
                  </li>
                  <li>
                    <code className="ae-code">
                      POST /api/admin/websites/{id}/assets
                    </code>
                  </li>
                </ul>
              </div>
            ) : null}
            {left === "deploy" ? (
              <div className="ae-panel-scroll ae-pane ae-side-tools">
                <p className="ae-section-label">Vercel</p>
                {deployStatus && !deployStatus.configured ? (
                  <p className="ae-note">
                    {deployStatus.message ||
                      "Set VERCEL_TOKEN to enable live deploy."}
                  </p>
                ) : (
                  <button
                    type="button"
                    className="ae-btn"
                    disabled={busy === "vercel"}
                    onClick={() =>
                      void (async () => {
                        setBusy("vercel");
                        setError("");
                        try {
                          const res = await fetch(
                            `/api/admin/websites/${id}/deploy`,
                            { method: "POST" },
                          );
                          const json = await res.json();
                          if (!res.ok)
                            throw new Error(json.error || "Deploy failed");
                          setNotice(`Deployed: ${json.url}`);
                        } catch (err) {
                          setError(
                            err instanceof Error
                              ? err.message
                              : "Deploy failed",
                          );
                        } finally {
                          setBusy("");
                        }
                      })()
                    }
                  >
                    {busy === "vercel" ? "Deploying…" : "Deploy to Vercel"}
                  </button>
                )}
                <p className="ae-section-label">Custom domain</p>
                <p className="ae-note">
                  Connect a hostname, then verify DNS. Status reflects real
                  lookups only.
                </p>
                <input
                  className="ae-search"
                  value={domainHostname}
                  onChange={(e) => setDomainHostname(e.target.value)}
                  placeholder="www.example.com"
                />
                <div className="ae-actions-row" style={{ padding: "8px 0" }}>
                  <button
                    type="button"
                    className="ae-btn"
                    disabled={!domainHostname.trim() || busy === "domain"}
                    onClick={() =>
                      void (async () => {
                        setBusy("domain");
                        setError("");
                        try {
                          const res = await fetch(
                            `/api/admin/websites/${id}/domains`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                hostname: domainHostname.trim(),
                              }),
                            },
                          );
                          const json = await res.json();
                          if (!res.ok) throw new Error(json.error || "Failed");
                          setNotice(
                            `Connected ${json.domain?.hostname || domainHostname}`,
                          );
                          setDomainHostname("");
                          const refreshed = await fetch(
                            `/api/admin/websites/${id}`,
                          );
                          const data = await refreshed.json();
                          if (refreshed.ok) setBundle(data);
                        } catch (err) {
                          setError(
                            err instanceof Error
                              ? err.message
                              : "Domain failed",
                          );
                        } finally {
                          setBusy("");
                        }
                      })()
                    }
                  >
                    Connect
                  </button>
                </div>
                <ul className="ae-review-list">
                  {(bundle.domains || []).map((d) => (
                    <li key={d.id || d.hostname}>
                      <strong>{d.hostname}</strong>
                      <span className="ae-note"> · {d.status}</span>
                      <button
                        type="button"
                        className="ae-btn ghost"
                        style={{ marginLeft: 8 }}
                        disabled={busy === "verify"}
                        onClick={() =>
                          void (async () => {
                            setBusy("verify");
                            setError("");
                            try {
                              const res = await fetch(
                                `/api/admin/websites/${id}/domains/verify`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    hostname: d.hostname,
                                  }),
                                },
                              );
                              const json = await res.json();
                              if (!res.ok)
                                throw new Error(json.error || "Verify failed");
                              setNotice(
                                json.verified
                                  ? `${json.hostname} verified`
                                  : `${json.hostname} not verified — ${json.detail || ""}`,
                              );
                            } catch (err) {
                              setError(
                                err instanceof Error
                                  ? err.message
                                  : "Verify failed",
                              );
                            } finally {
                              setBusy("");
                            }
                          })()
                        }
                      >
                        Verify
                      </button>
                    </li>
                  ))}
                </ul>
                <a
                  className="ae-btn ghost"
                  href={`/admin/websites/${id}/deploy`}
                  style={{ marginTop: 12 }}
                >
                  Full deploy page
                </a>
              </div>
            ) : null}
          </aside>
        ) : null}

        <div className="ae-canvas" ref={canvasRef}>
          <div className="ae-canvas-stage">
            <div className="ae-device-chip" aria-hidden>
              {VIEWPORTS.find((v) => v.width === width)?.label || "Custom"} ·{" "}
              {width}px
            </div>
            <div
              className="ae-canvas-site"
              data-ae-device-width={width}
              style={{
                width: `${width}px`,
                maxWidth: "none",
                flex: "0 0 auto",
                alignSelf: "center",
                minHeight: "100%",
                zoom: zoom / 100,
              }}
            >
              <CanvasHeightSync width={width} />
              <Puck.Preview />
            </div>
          </div>
        </div>

        <aside className="ae-right">
          <div className="ae-tabs ae-tabs-wrap">
            {(
              [
                "content",
                "layout",
                "typography",
                "appearance",
                "responsive",
                "advanced",
                "theme",
                "seo",
                "audit",
                "history",
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                className={right === tab ? "is-on" : ""}
                onClick={() => {
                  setRight(tab);
                  if (tab === "audit" || tab === "history")
                    void loadHealth().catch((err) => setError(err.message));
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="ae-selected">
            <small>Selected</small>
            <strong>{selectedLabel}</strong>
          </div>
          {[
            "content",
            "layout",
            "typography",
            "appearance",
            "responsive",
            "advanced",
          ].includes(right) ? (
            <ContextualInspector
              tab={right}
              selectedLabel={selectedLabel}
              selectedStyles={
                resolveStyleBox(
                  (selectedItem?.props as { styles?: StyleBox })?.styles,
                  breakpointFromWidth(width),
                ) as Record<string, string>
              }
              rawStyles={(selectedItem?.props as { styles?: StyleBox })?.styles}
              componentType={
                selectedItem ? (selectedItem.type as string) : null
              }
              selectedProps={
                selectedItem
                  ? (selectedItem.props as Record<string, unknown>)
                  : null
              }
              onPropsReplace={replaceSelectedProps}
              siteConfig={bundle.project.siteConfig}
              breakpoint={breakpointFromWidth(width)}
              onBreakpointChange={setStyleBreakpoint}
              onStylePatch={(patch) => applyStylePreset(patch)}
              onStylesReplace={replaceStyles}
              zoom={zoom}
              fieldsSlot={
                <>
                  {(right === "content" ||
                    right === "layout" ||
                    right === "advanced") && <Puck.Fields />}
                </>
              }
            />
          ) : null}
          {right === "theme" ? (
            <div className="ae-panel-scroll ae-pane">
              <p className="ae-section-label">Brand colours</p>
              <div className="ae-swatches">
                {(
                  [
                    "primary",
                    "secondary",
                    "accent",
                    "background",
                    "foreground",
                  ] as const
                ).map((key) => (
                  <label key={key} className="ae-swatch">
                    {key}
                    <input
                      type="color"
                      value={hexColor(bundle.project.theme[key])}
                      onChange={(event) => {
                        persistTheme({
                          ...bundle.project.theme,
                          [key]: event.target.value,
                        });
                      }}
                    />
                  </label>
                ))}
              </div>
              <p className="ae-section-label">Typography</p>
              <label className="ae-custom-field">
                <span>Heading font</span>
                <input
                  value={bundle.project.theme.headingFont || ""}
                  onChange={(event) => {
                    persistTheme({
                      ...bundle.project.theme,
                      headingFont: event.target.value,
                    });
                  }}
                  placeholder="Georgia, serif"
                />
              </label>
              <label className="ae-custom-field">
                <span>Body font</span>
                <input
                  value={bundle.project.theme.bodyFont || ""}
                  onChange={(event) => {
                    persistTheme({
                      ...bundle.project.theme,
                      bodyFont: event.target.value,
                    });
                  }}
                  placeholder="system-ui, sans-serif"
                />
              </label>
              <p className="ae-section-label">Layout · Buttons</p>
              <label className="ae-custom-field">
                <span>Corner radius</span>
                <input
                  value={bundle.project.theme.radius || ""}
                  onChange={(event) => {
                    persistTheme({
                      ...bundle.project.theme,
                      radius: event.target.value,
                    });
                  }}
                  placeholder="0.5rem"
                />
              </label>
              <DesignVariablesPanel
                theme={bundle.project.theme}
                onThemeChange={persistTheme}
                hasSelection={Boolean(selectedItem)}
                onApplyReference={(reference, target) => {
                  applyStylePreset({ [target]: reference });
                  setNotice(
                    target === "color"
                      ? "Text colour bound to variable"
                      : "Background bound to variable",
                  );
                }}
              />
              <p className="ae-note">
                Buttons and cards inherit primary/foreground tokens and radius
                via factory-site CSS variables. Custom variables use{" "}
                <code>--wf-var-*</code>.
              </p>
            </div>
          ) : null}
          {right === "seo" ? (
            <div className="ae-panel-scroll ae-pane">
              <p className="ae-issue">
                <strong>{bundle.project.seoConfig.title || "No title"}</strong>
                {bundle.project.seoConfig.description || "No description"}
              </p>
              <p className="ae-note">
                Canonical {factoryLivePath(bundle.project.slug)}
              </p>
              <p className="ae-note" style={{ marginTop: 12 }}>
                Client preview {factoryPreviewPath(bundle.project.slug)}
              </p>
            </div>
          ) : null}
          {right === "audit" ? (
            <div className="ae-panel-scroll ae-pane">
              <p className="ae-note">
                {health?.summary || "Open Health to measure this draft."}
              </p>
              {health?.issues.map((issue) => (
                <p className="ae-issue" key={issue.id}>
                  <strong>{issue.message}</strong>
                  {issue.hint}
                </p>
              ))}
            </div>
          ) : null}
          {right === "history" ? (
            <div className="ae-panel-scroll ae-pane">
              <HistoryPanel
                bundle={bundle}
                busy={Boolean(busy)}
                onPublish={(note) =>
                  publishLiveNamed(note).catch((err) => {
                    setError(err.message);
                    throw err;
                  })
                }
                onRestore={(version) =>
                  restoreVersionFromHistory(version).catch((err) => {
                    setError(err.message);
                    throw err;
                  })
                }
                onRename={(version, note) =>
                  renameVersionFromHistory(version, note).catch((err) => {
                    setError(err.message);
                    throw err;
                  })
                }
              />
            </div>
          ) : null}
        </aside>
      </div>
      <StudioBottomBar
        active={bottomUtility}
        onOpenComponents={() => toggleLeft("add")}
        onSelect={(utility) => {
          setBottomUtility(utility);
          if (utility === "ai") toggleLeft("ai");
          if (utility === "assets") toggleLeft("assets");
          if (utility === "layers") toggleLeft("layers");
          if (utility === "history") {
            setRight("history");
            setLeftOpen(false);
          }
          if (utility === "health") {
            setRight("audit");
            void loadHealth().catch((err) => setError(err.message));
          }
          if (utility === "deploy") {
            setLeft("deploy");
            setLeftOpen(true);
            void fetch(`/api/admin/websites/${id}/deploy`)
              .then((res) => res.json())
              .then((data) =>
                setDeployStatus({
                  configured: Boolean(data.configured),
                  message: data.message || "",
                }),
              )
              .catch(() => null);
          }
        }}
      />
      {shortcutsOpen ? (
        <div className="ae-cmdk-root" role="dialog" aria-label="Shortcuts">
          <button
            type="button"
            className="ae-cmdk-backdrop"
            aria-label="Close"
            onClick={() => setShortcutsOpen(false)}
          />
          <div className="ae-cmdk ae-shortcuts-card">
            <h3>Keyboard shortcuts</h3>
            <ul>
              <li>
                <kbd>⌘/Ctrl</kbd>+<kbd>Z</kbd> Undo
              </li>
              <li>
                <kbd>⌘/Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> Redo
              </li>
              <li>
                <kbd>⌘/Ctrl</kbd>+<kbd>S</kbd> Save
              </li>
              <li>
                <kbd>⌘/Ctrl</kbd>+<kbd>P</kbd> Preview
              </li>
              <li>
                <kbd>⌘/Ctrl</kbd>+<kbd>K</kbd> Command palette
              </li>
              <li>
                <kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd> Breakpoints
              </li>
              <li>
                <kbd>+</kbd>/<kbd>-</kbd>/<kbd>0</kbd> Zoom
              </li>
              <li>
                <kbd>F</kbd> Focus mode
              </li>
              <li>
                <kbd>Delete</kbd> Remove selected layer(s)
              </li>
              <li>
                <kbd>Esc</kbd> Clear selection / close panel
              </li>
              <li>
                <kbd>?</kbd> This help
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
