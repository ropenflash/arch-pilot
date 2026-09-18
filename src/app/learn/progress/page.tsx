import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/learn/progress-dashboard";

export const metadata: Metadata = {
  title: "Learning progress",
  description: "See strengths, completed architecture practice, and what to revisit.",
};

export default function LearnProgressPage() {
  return <ProgressDashboard />;
}
