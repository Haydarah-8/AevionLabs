import { NextResponse } from "next/server";
import JSZip from "jszip";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSkillPackage } from "@/features/website-factory/developer/skills-packages";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const pkg = getSkillPackage(id);
  if (!pkg) {
    return NextResponse.json({ error: "Unknown skill package" }, { status: 404 });
  }

  const zip = new JSZip();
  for (const [name, content] of Object.entries(pkg.files)) {
    zip.file(`${pkg.id}/${name}`, content);
  }
  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="aevion-skill-${pkg.id}.zip"`,
    },
  });
}
