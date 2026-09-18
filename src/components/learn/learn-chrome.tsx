import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { COURSE_STAGES, getStage, type CourseStageId } from "@/lib/learn/course";
import { cn } from "@/lib/utils";

export function LearnPathHeader({
  stageId,
  detail,
  className,
}: {
  stageId: CourseStageId;
  detail?: string;
  className?: string;
}) {
  const stage = getStage(stageId);
  return (
    <div className={cn("mb-6", className)}>
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Path
      </Link>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Stage {stage.number} of {COURSE_STAGES.length} · {stage.title}
        {detail ? ` · ${detail}` : ""}
      </p>
    </div>
  );
}

export function StagePills({ activeId }: { activeId: CourseStageId }) {
  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {COURSE_STAGES.map((stage) => (
        <li key={stage.id}>
          <Link
            href={`/learn#${stage.id}`}
            className={cn(
              "rounded-full border px-2.5 py-1",
              stage.id === activeId
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {stage.number}. {stage.title}
          </Link>
        </li>
      ))}
    </ol>
  );
}
