import { notFound } from "next/navigation";
import { RateLimiterCourse } from "@/components/learn/rate-limiter-course";
import {
  getRateLimiterSection,
  rateLimiterStaticParams,
} from "@/lib/learn/rate-limiter-course";

export function generateStaticParams() {
  return rateLimiterStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: sectionId } = await params;
  const section = getRateLimiterSection(sectionId);
  return {
    title: section
      ? `${section.title} — Rate limiter course`
      : "Rate limiter course",
  };
}

export default async function RateLimiterSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: sectionId } = await params;
  const section = getRateLimiterSection(sectionId);
  if (!section) notFound();
  return <RateLimiterCourse key={section.id} section={section} />;
}
