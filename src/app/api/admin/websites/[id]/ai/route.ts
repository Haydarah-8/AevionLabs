import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  applyToolCalls,
  planFromPrompt,
  planWithOptionalModel,
  type AiPlan,
} from "@/features/website-factory/ai/tools";
import { analyzeAiPlan } from "@/features/website-factory/ai/ops";
import {
  addPage,
  getProjectBundle,
  savePageDraft,
  updateProject,
} from "@/features/website-factory/services/store";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";
import { isPuckData } from "@/features/website-factory/types";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const bundle = await getProjectBundle(id);
    if (!bundle)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const page =
      bundle.pages.find((item) => item.id === body.pageId) ?? bundle.pages[0];
    if (!page) throw new Error("No page");
    if (!isPuckData(page.draftData)) {
      throw new Error("AI tools currently support Puck pages only");
    }

    let plan: AiPlan;
    if (body.plan) {
      const analysis = analyzeAiPlan(body.plan);
      if (!analysis.writableCalls.length) {
        return NextResponse.json(
          {
            error: analysis.errors[0] || "Plan has no writable operations",
            errors: analysis.errors,
            plan: analysis.plan,
          },
          { status: 400 },
        );
      }
      plan = analysis.plan;
    } else {
      plan =
        (await planWithOptionalModel(String(body.prompt || ""), bundle)) ??
        planFromPrompt(String(body.prompt || ""), bundle);
      plan = analyzeAiPlan(plan).plan;
    }

    if (!body.apply) {
      const analysis = analyzeAiPlan(plan);
      return NextResponse.json({
        plan: analysis.plan,
        analysis: {
          destructive: analysis.destructive,
          confirmMessage: analysis.confirmMessage,
          errors: analysis.errors,
          ops: analysis.writableCalls.map((call) => ({
            name: call.name,
            summary: call,
          })),
        },
      });
    }

    const analysis = analyzeAiPlan(plan);
    if (analysis.errors.length && !analysis.writableCalls.length) {
      return NextResponse.json(
        { error: analysis.errors[0], errors: analysis.errors, plan: analysis.plan },
        { status: 400 },
      );
    }
    if (analysis.destructive && !body.confirmDestructive) {
      return NextResponse.json(
        {
          error: "Destructive plan requires confirmation",
          requiresConfirm: true,
          confirmMessage: analysis.confirmMessage,
          plan: analysis.plan,
        },
        { status: 409 },
      );
    }

    const result = applyToolCalls(
      bundle,
      page.draftData,
      analysis.writableCalls,
    );
    await savePageDraft(page.id, result.data);
    if (result.theme) await updateProject(id, { theme: result.theme });
    if (result.seo) await updateProject(id, { seoConfig: result.seo });
    if (result.pageTitle) {
      await addPage(id, {
        title: result.pageTitle,
        slug:
          typeof plan.calls.find((c) => c.name === "createPage")?.args.slug ===
          "string"
            ? String(plan.calls.find((c) => c.name === "createPage")?.args.slug)
            : undefined,
      });
    }
    const next = await getProjectBundle(id);
    return NextResponse.json({ plan: analysis.plan, bundle: next });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "AI failed") },
      { status: 400 },
    );
  }
}
