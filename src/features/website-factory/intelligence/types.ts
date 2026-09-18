export type ImportedItem<T> = T & { include: boolean };

export type IntelligencePage = {
  url: string;
  title: string;
  type: string;
  heading: string;
  excerpt: string;
  body: string;
};

export type IntelligenceImage = {
  url: string;
  alt: string;
  kind: "logo" | "favicon" | "hero" | "service" | "gallery" | "team" | "social";
};

export type IntelligenceResult = {
  sourceUrl: string;
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  postcode: string;
  logoUrl: string;
  faviconUrl: string;
  heroUrl: string;
  social: Record<string, string>;
  brandColors: string[];
  services: ImportedItem<{ name: string; description: string; imageUrl: string }>[];
  reviews: ImportedItem<{
    customerName: string;
    quote: string;
    rating: number;
    source: string;
  }>[];
  pages: ImportedItem<IntelligencePage>[];
  images: ImportedItem<IntelligenceImage>[];
  provenance: Array<{
    sourceUrl: string;
    sourcePage: string;
    importedAt: string;
    contentType: string;
  }>;
  robotsAllowed: boolean;
  engine: string;
};
