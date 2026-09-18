import { notFound } from "next/navigation";
import { MindsetStudio } from "@/components/learn/mindset-studio";
import { getMindsetLesson, MINDSET_LESSONS } from "@/lib/learn/mindset";

export function generateStaticParams() {
  return MINDSET_LESSONS.map((lesson) => ({ slug: lesson.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getMindsetLesson(slug);
  return {
    title: lesson ? `${lesson.title} — System design mindset` : "System design mindset",
    description: lesson?.concept,
  };
}

export default async function MindsetLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getMindsetLesson(slug);
  if (!lesson) notFound();
  return <MindsetStudio key={lesson.id} lesson={lesson} />;
}
