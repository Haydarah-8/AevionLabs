import type { Metadata } from "next";
import { ChromeError } from "@/components/site/lost/ChromeError";

export const metadata: Metadata = {
  title: "No internet",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <ChromeError kind="offline" />;
}
