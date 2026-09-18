"use client";

import { useLenis } from "lenis/react";

const CHAPTERS = [
  { href: "#in-a-build", label: "In a build" },
  { href: "#uses", label: "Uses" },
  { href: "#engagement", label: "Engagement" },
  { href: "#examples", label: "Examples" },
  { href: "#leave-with", label: "Leave with" },
  { href: "#questions", label: "Questions" },
] as const;

export function TopicChapters() {
  const lenis = useLenis();

  return (
    <nav className="topic-chapters" aria-label="On this page">
      <ul>
        {CHAPTERS.map((chapter) => (
          <li key={chapter.href}>
            <a
              href={chapter.href}
              onClick={(event) => {
                const id = chapter.href.slice(1);
                const target = document.getElementById(id);
                if (!target) return;
                event.preventDefault();
                lenis?.scrollTo(target, { offset: -88 });
                if (!lenis) {
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                history.replaceState(null, "", chapter.href);
              }}
            >
              {chapter.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
