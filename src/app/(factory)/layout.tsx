import type { Metadata } from "next";
import "@/app/factory-site.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function FactoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
