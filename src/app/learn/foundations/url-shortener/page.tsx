import type { Metadata } from "next";
import { FoundationScopeStudio } from "@/components/learn/foundation-scope-studio";

export const metadata: Metadata = {
  title: "Requirements before architecture — URL shortener",
  description:
    "Learn to clarify users, scope, traffic, latency, and retention before drawing a system.",
};

export default function UrlShortenerFoundationPage() {
  return <FoundationScopeStudio />;
}
