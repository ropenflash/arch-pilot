import { notFound } from "next/navigation";
import { EstimateStudio } from "@/components/learn/estimate-studio";
import { ESTIMATE_SCENARIOS, isEstimateScenario } from "@/lib/learn/estimate";

const SECTIONS = ["units", "latency", "uptime", ...ESTIMATE_SCENARIOS.map((item) => item.id)];

export function generateStaticParams() {
  return SECTIONS.map((slug) => ({ slug }));
}

export default async function EstimateSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== "units" && slug !== "latency" && slug !== "uptime" && !isEstimateScenario(slug)) {
    notFound();
  }
  return <EstimateStudio slug={slug} />;
}
