import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { applyToolCalls, planFromPrompt, planWithOptionalModel } from "@/features/website-factory/ai/tools";
import { addPage, getProjectBundle, savePageDraft, updateProject } from "@/features/website-factory/services/store";
import { factoryErrorMessage } from "@/features/website-factory/services/schemas";

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
    if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const page = bundle.pages.find((item) => item.id === body.pageId) ?? bundle.pages[0];
    if (!page) throw new Error("No page");
    const plan =
      body.plan ??
      (await planWithOptionalModel(String(body.prompt || ""), bundle)) ??
      planFromPrompt(String(body.prompt || ""), bundle);
    if (!body.apply) return NextResponse.json({ plan });
    const result = applyToolCalls(bundle, page.draftData, plan.calls || []);
    await savePageDraft(page.id, result.data);
    if (result.theme) await updateProject(id, { theme: result.theme });
    if (result.seo) await updateProject(id, { seoConfig: result.seo });
    if (result.pageTitle) await addPage(id, { title: result.pageTitle });
    const next = await getProjectBundle(id);
    return NextResponse.json({ plan, bundle: next });
  } catch (err) {
    return NextResponse.json(
      { error: factoryErrorMessage(err, "AI failed") },
      { status: 400 },
    );
  }
}
