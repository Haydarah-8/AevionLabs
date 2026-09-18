import type { Metadata } from "next";
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
  return factoryMetadata(slug, path, "live");
}

export default async function LiveSitePage({
  params,
}: {
  params: Promise<{ slug: string; path?: string[] }>;
}) {
  const { slug, path } = await params;
  return renderFactoryPage(slug, path, "live");
}
