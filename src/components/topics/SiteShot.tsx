"use client";

import { useState } from "react";

function hostLabel(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

export function SiteShot({
  name,
  url,
  fallback,
  className = "",
}: {
  name: string;
  url: string;
  fallback: { src: string; alt: string };
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = failed
    ? fallback.src
    : `/api/site-preview/shot?url=${encodeURIComponent(url)}`;

  return (
    <figure className={`topic-shot ${className}`.trim()}>
      <div className="topic-shot-bar">
        <div className="min-w-0 flex-1">
          <p className="topic-shot-name">{name}</p>
          <p className="topic-shot-url">{hostLabel(url)}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="topic-shot-open"
        >
          Open site
        </a>
      </div>
      <div className="topic-shot-frame">
        {/* External site shots; next/image would need every host allowlisted. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={failed ? fallback.alt : `${name} official site`}
          onError={() => setFailed(true)}
        />
      </div>
    </figure>
  );
}
