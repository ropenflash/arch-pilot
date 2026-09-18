import { notFound } from "next/navigation";
import { ProblemStudio } from "@/components/learn/problem-studio";
import { getProblem, PRACTICE_PROBLEMS } from "@/lib/learn/problems";

export function generateStaticParams() {
  return PRACTICE_PROBLEMS.map((problem) => ({ slug: problem.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = getProblem(slug);
  return {
    title: problem ? `Design ${problem.title}` : "Design a system",
  };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) notFound();
  return <ProblemStudio key={slug} problemId={slug} />;
}
