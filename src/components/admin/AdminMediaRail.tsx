import type { ReactNode } from "react";

export function AdminMediaRail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section>
      <p className="mb-4 text-[0.8rem] text-[#737373]">
        {label}
      </p>
      <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2">
        {children}
      </div>
    </section>
  );
}
