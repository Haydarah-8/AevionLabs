import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import {
  factoryMetadata,
  renderFactoryPage,
} from "@/features/website-factory/public/render-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; path?: string[] }>;
}): Promise<Metadata> {
  const { slug, path } = await params;
  return factoryMetadata(slug, path, "draft");
}

export default async function OperatorPreviewPage({
  params,
}: {
  params: Promise<{ slug: string; path?: string[] }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  const { slug, path } = await params;
  return renderFactoryPage(slug, path, "draft");
}
