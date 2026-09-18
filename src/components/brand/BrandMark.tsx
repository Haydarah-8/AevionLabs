import { cn } from "@/lib/utils";

/** Aperture-A: two legs of an A, with a lens punched through the counter. */
export function BrandMark({
  className,
  title = "Aevion Labs",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={cn("nav_logo_mark", className)}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16 2.1 2.4 30h5.55L16 10.2 24.05 30H29.6L16 2.1Zm0 15.2a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4Z"
      />
      <circle cx="16" cy="21" r="1.15" fill="currentColor" />
    </svg>
  );
}
