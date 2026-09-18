import { notFound } from "next/navigation";
import { LessonView } from "@/components/learn/lesson-view";
import { allLessons, getLesson } from "@/lib/learn/syllabus";

export function generateStaticParams() {
  return allLessons().map((lesson) => ({ slug: lesson.slug }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
