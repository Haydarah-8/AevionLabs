import { cn } from "@/lib/utils";

type EwgLogoProps = {
  variant?: "light" | "dark" | "inherit";
  /** header: main nav bar · drawer: mobile menu chrome · footer: site footer */
  size?: "header" | "drawer" | "footer";
  className?: string;
};

/** Official Aevion Labs wordmark — same mark as the site navbar. */
export function EwgLogo({
  variant = "dark",
  size = "header",
  className,
}: EwgLogoProps) {
  const color =
    variant === "inherit"
      ? "currentColor"
      : variant === "light"
        ? "#ffffff"
        : "#111111";

  const type =
    size === "footer"
      ? "text-[clamp(1.75rem,4.5vw,3.25rem)] font-medium leading-[0.85] tracking-[-0.02em]"
      : size === "drawer"
        ? "text-[1.15rem] font-medium leading-[0.85] tracking-[-0.005em] sm:text-[1.25rem]"
        : "text-[1.2rem] font-medium leading-[0.85] tracking-[-0.005em] sm:text-[1.4rem]";

  return (
    <span
      className={cn("inline-flex items-center font-sans uppercase", type, className)}
      style={{ color }}
    >
      AEVION LABS
    </span>
  );
}
