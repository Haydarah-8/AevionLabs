"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { imageSrcNeedsUnoptimized } from "@/lib/utils";

export type WorkCard = {
  slug: string;
  client: string;
  overview: string;
  year: string;
  services: string[];
  image: { src: string; alt: string };
};

export function WorkIndex({ projects }: { projects: WorkCard[] }) {
  const [active, setActive] = useState(0);
  const current = projects[active] ?? projects[0];

  if (!projects.length) {
    return (
      <SectionFrame>
        <p className="site-body m-0">Selected work will appear here.</p>
      </SectionFrame>
    );
  }

  return (
    <SectionFrame>
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-black/10 pb-6">
        <p className="m-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]">
          Selected work
        </p>
        <p className="m-0 shrink-0 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[#8a8a8a]">
          {String(projects.length).padStart(2, "0")} projects
        </p>
      </div>

      <div className="mt-10 grid min-w-0 gap-10 lg:mt-14 lg:grid-cols-[minmax(16rem,0.42fr)_minmax(0,1fr)] lg:gap-16">
        <ol className="m-0 grid list-none content-start gap-0 p-0">
          {projects.map((project, index) => {
            const open = active === index;
            return (
              <li
                key={project.slug}
                className="border-b border-black/10 last:border-b-0"
              >
                <Link
                  href={`/work/${project.slug}`}
                  className="block py-4 no-underline lg:hidden"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="shrink-0 text-[0.6875rem] font-medium tracking-[0.18em] text-[#8a8a8a]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[1.15rem] font-normal tracking-tight text-[#111]">
                      {project.client}
                    </span>
                  </span>
                  <span className="mt-3 block aspect-[16/10] overflow-hidden bg-neutral-200">
                    {project.image.src ? (
                      <Image
                        src={project.image.src}
                        alt={project.image.alt}
                        width={1200}
                        height={750}
                        className="h-full w-full object-cover"
                        unoptimized={imageSrcNeedsUnoptimized(project.image.src)}
                      />
                    ) : null}
                  </span>
                  <span className="mt-3 block text-[0.975rem] font-light leading-[1.7] text-[#525252]">
                    {project.overview}
                  </span>
                </Link>
                <Link
                  href={`/work/${project.slug}`}
                  className="hidden w-full items-baseline gap-4 py-5 no-underline lg:flex"
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  aria-current={open ? "true" : undefined}
                >
                  <span
                    className={`shrink-0 text-[0.6875rem] font-medium tracking-[0.18em] transition-colors duration-300 ${
                      open ? "text-[#111]" : "text-[#8a8a8a]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`min-w-0 text-[1.15rem] font-normal leading-[1.3] tracking-tight transition-colors duration-300 ${
                      open ? "text-[#111]" : "text-[#8a8a8a]"
                    }`}
                  >
                    {project.client}
                  </span>
                  <span
                    className={`ml-auto shrink-0 text-[0.6875rem] tracking-[0.12em] transition-colors duration-300 ${
                      open ? "text-[#111]" : "text-[#8a8a8a]"
                    }`}
                  >
                    {project.year}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        {current ? (
          <article
            key={current.slug}
            className="how-step-pane hidden min-w-0 lg:block"
          >
            <Link href={`/work/${current.slug}`} className="group block no-underline">
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
                {current.image.src ? (
                  <Image
                    src={current.image.src}
                    alt={current.image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    unoptimized={imageSrcNeedsUnoptimized(current.image.src)}
                  />
                ) : null}
              </div>
              <p className="mt-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#8a8a8a]">
                {current.year}
                {current.services[0] ? ` · ${current.services[0]}` : ""}
              </p>
              <h2 className="mt-3 text-[clamp(1.65rem,3vw,2.35rem)] font-normal leading-[1.15] tracking-[-0.03em] text-[#111]">
                {current.client}
              </h2>
              <p className="site-body mt-4 max-w-xl">{current.overview}</p>
              <span className="site-link-arrow mt-8 inline-flex">View project</span>
            </Link>
          </article>
        ) : null}
      </div>
    </SectionFrame>
  );
}
