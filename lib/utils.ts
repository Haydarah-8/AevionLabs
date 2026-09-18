import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* GSAP-equivalent cubic-bezier easings used across the site */
export const EASE = {
  power2out: [0.33, 1, 0.68, 1] as const,
  power2inOut: [0.65, 0, 0.35, 1] as const,
  power2in: [0.32, 0, 0.67, 1] as const,
  power3out: [0.25, 1, 0.5, 1] as const,
  power3inOut: [0.76, 0, 0.24, 1] as const,
  power4out: [0.22, 1, 0.36, 1] as const,
  power4inOut: [0.83, 0, 0.17, 1] as const,
};
