import { notFound } from "next/navigation";
import { PROJECTS } from "@/lib/projects";
import { ProjectPage } from "@/components/project/ProjectPage";

export function generateStaticParams() {
  return Object.keys(PROJECTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS[slug];
  if (!project) return {};
  return { title: `${project.client} · AEVION LABS` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS[slug];
  if (!project) notFound();
  return <ProjectPage project={project} />;
}
