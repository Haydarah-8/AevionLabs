import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

export const ctaSchema = z.object({
  label: z.string().trim().max(80).default(""),
  href: z.string().trim().max(240).default(""),
});

export const themeSchema = z.object({
  primary: z.string().default("#111111"),
  secondary: z.string().default("#3f3f3f"),
  accent: z.string().default("#111111"),
  background: z.string().default("#ffffff"),
  foreground: z.string().default("#111111"),
  headingFont: z.string().default("Georgia, 'Times New Roman', serif"),
  bodyFont: z.string().default("Arial, Helvetica, sans-serif"),
  radius: z.string().default("0px"),
});

export const businessInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: slugSchema.optional(),
  tagline: z.string().trim().max(200).default(""),
  description: z.string().trim().max(4000).default(""),
  industry: z.string().trim().max(80).default(""),
  logoUrl: z.string().trim().max(2000).default(""),
  faviconUrl: z.string().trim().max(2000).default(""),
  heroUrl: z.string().trim().max(2000).default(""),
  phone: z.string().trim().max(40).default(""),
  email: z
    .string()
    .trim()
    .default("")
    .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid email"),
  website: z.string().trim().max(240).default(""),
  address: z.string().trim().max(240).default(""),
  postcode: z.string().trim().max(20).default(""),
  openingHours: z.record(z.string(), z.string()).default({}),
  social: z.record(z.string(), z.string()).default({}),
  yearsInBusiness: z.number().int().min(0).max(200).nullable().default(null),
  certifications: z.array(z.string()).default([]),
  awards: z.array(z.string()).default([]),
  primaryCta: ctaSchema.default({ label: "", href: "" }),
  secondaryCta: ctaSchema.default({ label: "", href: "" }),
  usps: z.array(z.string()).default([]),
  trustIndicators: z.array(z.string()).default([]),
  prospectLabel: z.string().trim().max(160).default(""),
  services: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().max(2000).default(""),
        imageUrl: z.string().trim().max(2000).default(""),
      }),
    )
    .default([]),
  team: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        role: z.string().trim().max(120).default(""),
        photoUrl: z.string().trim().max(2000).default(""),
        bio: z.string().trim().max(2000).default(""),
      }),
    )
    .default([]),
  reviews: z
    .array(
      z.object({
        customerName: z.string().trim().min(1).max(120),
        quote: z.string().trim().max(2000).default(""),
        rating: z.number().int().min(1).max(5).default(5),
        source: z.string().trim().max(80).default(""),
      }),
    )
    .default([]),
  media: z
    .array(
      z.object({
        kind: z.string().trim().max(40).default("gallery"),
        url: z.string().trim().min(1).max(2000),
        alt: z.string().trim().max(200).default(""),
      }),
    )
    .default([]),
});

export type BusinessInput = z.infer<typeof businessInputSchema>;

export function factoryErrorMessage(err: unknown, fallback = "Request failed") {
  if (
    err &&
    typeof err === "object" &&
    "issues" in err &&
    Array.isArray((err as { issues: unknown }).issues)
  ) {
    return (err as { issues: Array<{ path: Array<string | number>; message: string }> }).issues
      .map((issue) => {
        const path = issue.path.filter(Boolean).join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      })
      .join("; ");
  }
  return err instanceof Error ? err.message : fallback;
}
