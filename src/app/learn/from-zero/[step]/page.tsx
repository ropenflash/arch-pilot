import { notFound } from "next/navigation";
import { ChallengeStudio } from "@/components/learn/challenge-studio";
import { FROM_ZERO_STEPS, stepIndexById } from "@/lib/learn/campaign";

export function generateStaticParams() {
  return FROM_ZERO_STEPS.map((step) => ({ step: step.id }));
}

export default async function FromZeroStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  if (stepIndexById(step) < 0) notFound();
  return <ChallengeStudio stepId={step} />;
}
