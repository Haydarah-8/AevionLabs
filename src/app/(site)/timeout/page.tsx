import type { Metadata } from "next";
import { ChromeError } from "@/components/site/lost/ChromeError";

export const metadata: Metadata = {
  title: "Taking too long",
  robots: { index: false, follow: false },
};

export default function TimeoutPage() {
  return <ChromeError kind="timeout" />;
}
