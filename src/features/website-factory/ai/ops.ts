/**
 * Structured AI ops validation + destructive confirm (Phase 13).
 * Plans stay as AiPlan; apply requires confirmDestructive when flagged.
 */

import { isRegisteredComponent } from "@/features/website-factory/registry";
import type { AiPlan, AiToolCall, AiToolName } from "./tools";

/** Ops that mutate site/page state when applied. */
export const AI_WRITE_OPS = new Set<AiToolName>([
  "updateField",
  "addComponent",
  "removeComponent",
  "moveComponent",
  "duplicateComponent",
  "createPage",
  "updateTheme",
  "updateSEO",
]);

/** Ops that delete or irreversibly strip content (need confirm). */
export const AI_DESTRUCTIVE_OPS = new Set<AiToolName>(["removeComponent"]);

export type AiPlanAnalysis = {
  plan: AiPlan;
  errors: string[];
  destructive: boolean;
  confirmMessage: string | null;
  writableCalls: AiToolCall[];
};

export function isAiToolName(name: unknown): name is AiToolName {
  return (
    typeof name === "string" &&
    (AI_WRITE_OPS.has(name as AiToolName) ||
      name === "getWebsite" ||
      name === "getPage" ||
      name === "getBusiness" ||
      name === "getTheme" ||
      name === "listComponents")
  );
}

export function isDestructiveCall(call: AiToolCall): boolean {
  return AI_DESTRUCTIVE_OPS.has(call.name);
}

export function describeCall(call: AiToolCall): string {
  const args = call.args || {};
  switch (call.name) {
    case "addComponent":
      return `Add ${String(args.type || "component")}${
        args.after ? ` after ${String(args.after)}` : ""
      }`;
    case "removeComponent":
      return `Remove all “${String(args.type || "component")}” blocks`;
    case "moveComponent":
      return `Move ${String(args.type || "component")} up`;
    case "duplicateComponent":
      return `Duplicate ${String(args.type || "component")}`;
    case "updateField":
      return `Set ${String(args.type || "?")}.${String(args.field || "?")}`;
    case "updateTheme":
      return `Update theme (${Object.keys(args).join(", ") || "tokens"})`;
    case "updateSEO":
      return `Update SEO (${Object.keys(args).join(", ") || "fields"})`;
    case "createPage":
      return `Create page “${String(args.title || "Page")}”`;
    default:
      return call.name;
  }
}

function validateCall(call: AiToolCall): string | null {
  if (!AI_WRITE_OPS.has(call.name)) {
    return `Unsupported or read-only op: ${call.name}`;
  }
  if (
    call.name === "addComponent" ||
    call.name === "removeComponent" ||
    call.name === "moveComponent" ||
    call.name === "duplicateComponent" ||
    call.name === "updateField"
  ) {
    const type = String(call.args.type || "");
    if (!type) return `${call.name} requires args.type`;
    if (
      (call.name === "addComponent" || call.name === "updateField") &&
      !isRegisteredComponent(type)
    ) {
      return `Unknown component type: ${type}`;
    }
  }
  if (call.name === "updateField" && !String(call.args.field || "")) {
    return "updateField requires args.field";
  }
  if (call.name === "createPage" && !String(call.args.title || "").trim()) {
    return "createPage requires args.title";
  }
  return null;
}

/**
 * Sanitize LLM/heuristic plans: allowlisted write ops only, force destructive flag.
 */
export function analyzeAiPlan(raw: unknown): AiPlanAnalysis {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      plan: { explanation: "", destructive: false, calls: [] },
      errors: ["Invalid plan"],
      destructive: false,
      confirmMessage: null,
      writableCalls: [],
    };
  }
  const rec = raw as Record<string, unknown>;
  const explanation =
    typeof rec.explanation === "string" ? rec.explanation : "";
  const rawCalls = Array.isArray(rec.calls) ? rec.calls : [];
  const writableCalls: AiToolCall[] = [];

  for (const item of rawCalls) {
    if (!item || typeof item !== "object") {
      errors.push("Malformed tool call");
      continue;
    }
    const callRec = item as Record<string, unknown>;
    const name = callRec.name;
    if (!isAiToolName(name)) {
      errors.push(`Unknown tool: ${String(name)}`);
      continue;
    }
    if (!AI_WRITE_OPS.has(name)) continue; // skip reads silently
    const call: AiToolCall = {
      name,
      args:
        callRec.args &&
        typeof callRec.args === "object" &&
        !Array.isArray(callRec.args)
          ? (callRec.args as Record<string, unknown>)
          : {},
    };
    const err = validateCall(call);
    if (err) {
      errors.push(err);
      continue;
    }
    writableCalls.push(call);
  }

  const destructive =
    Boolean(rec.destructive) || writableCalls.some(isDestructiveCall);
  const removals = writableCalls.filter((c) => c.name === "removeComponent");
  const confirmMessage = destructive
    ? removals.length
      ? `This plan removes ${removals.length} component type${
          removals.length === 1 ? "" : "s"
        } (${removals
          .map((c) => String(c.args.type || "?"))
          .join(", ")}). Apply anyway?`
      : "This plan is marked destructive. Apply anyway?"
    : null;

  const plan: AiPlan = {
    explanation: explanation || "Structured plan",
    destructive,
    calls: writableCalls,
  };

  if (!writableCalls.length && !errors.length) {
    errors.push("Plan has no writable operations");
  }

  return { plan, errors, destructive, confirmMessage, writableCalls };
}

export function requiresDestructiveConfirm(plan: AiPlan): boolean {
  return analyzeAiPlan(plan).destructive;
}
