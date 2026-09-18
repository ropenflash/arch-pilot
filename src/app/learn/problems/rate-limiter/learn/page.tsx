import { redirect } from "next/navigation";
import { rateLimiterLessonHref } from "@/lib/learn/rate-limiter-course";

export default function RateLimiterLearnPage() {
  redirect(rateLimiterLessonHref());
}
