import { notFound } from "next/navigation";
import { ApproachStudio } from "@/components/learn/approach-studio";
import { APPROACH_STEPS } from "@/lib/learn/approach";

export function generateStaticParams() {
  return APPROACH_STEPS.map((step) => ({ step: step.id }));
}

export default async function ApproachStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  if (!APPROACH_STEPS.some((item) => item.id === step)) notFound();
  return <ApproachStudio stepId={step} />;
}
