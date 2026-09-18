import { redirect } from "next/navigation";
import { mindsetLessonHref } from "@/lib/learn/mindset";

export default function MindsetPage() {
  redirect(mindsetLessonHref());
}
