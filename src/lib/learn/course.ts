import {
  SYLLABUS,
  allLessons,
  getLesson,
  moduleForLesson,
  type Lesson,
  type SyllabusModule,
} from "@/lib/learn/syllabus";

export type CourseStageId = "grow" | "size" | "hour" | "designs";

export type CourseStage = {
  id: CourseStageId;
  number: number;
  title: string;
  blurb: string;
  cue: string;
  moduleIds: string[];
};

export const COURSE_STAGES: CourseStage[] = [
  {
    id: "grow",
    number: 1,
    title: "Grow the system",
    blurb:
      "Start with one box. Each lesson adds the next piece only when the last design actually breaks — balancer, replicas, cache, CDN, queues, shards.",
    cue: "Read a short lesson, then draw that change on the board.",
    moduleIds: [
      "one-machine",
      "split-stack",
      "web-tier",
      "data-copies",
      "faster-reads",
      "interchangeable",
      "regions",
      "async",
      "partition",
      "operate",
    ],
  },
  {
    id: "size",
    number: 2,
    title: "Size it",
    blurb:
      "Rough QPS, storage, latency, and uptime. Enough to know whether you need four boxes or four hundred — not a spreadsheet.",
    cue: "Learn the shortcut, then try live numbers on a real-looking product.",
    moduleIds: ["napkin"],
  },
  {
    id: "hour",
    number: 3,
    title: "Run the hour",
    blurb:
      "Now put it together: scope the prompt, sketch a blueprint, size it, go deep on what hurts, then wrap. That is the whole game.",
    cue: "Practice the questions you ask — not a stack you dump in the first minute.",
    moduleIds: ["approach"],
  },
  {
    id: "designs",
    number: 4,
    title: "Design these systems",
    blurb:
      "The prompts are already written. You are the candidate: scope v1, size it, draw the board. Start with a rate limiter; finish with files and video.",
    cue: "Do not invent a brief. Pick a system and design it.",
    moduleIds: [],
  },
];

export function getStage(id: CourseStageId) {
  return COURSE_STAGES.find((stage) => stage.id === id) ?? COURSE_STAGES[0]!;
}

export function modulesForStage(stage: CourseStage): SyllabusModule[] {
  return stage.moduleIds
    .map((id) => SYLLABUS.find((module) => module.id === id))
    .filter((module): module is SyllabusModule => Boolean(module));
}

export function lessonsForStage(stage: CourseStage): Lesson[] {
  return modulesForStage(stage).flatMap((module) => module.lessons);
}

export function stageForLesson(slug: string): CourseStage {
  const lessonModule = moduleForLesson(slug);
  const stage = COURSE_STAGES.find((item) =>
    item.moduleIds.includes(lessonModule?.id ?? ""),
  );
  return stage ?? COURSE_STAGES[0]!;
}

export function stageIndexInCourse(slug: string) {
  const stage = stageForLesson(slug);
  const lessons = lessonsForStage(stage);
  return lessons.findIndex((lesson) => lesson.slug === slug);
}

export function continueLesson(completed: string[]): Lesson {
  const lessons = allLessons();
  return lessons.find((lesson) => !completed.includes(lesson.slug)) ?? lessons[lessons.length - 1]!;
}

export function practiceFor(lesson: Lesson): { href: string; label: string } | null {
  if (lesson.practiceHref) {
    if (lesson.practiceHref.startsWith("/learn/estimate")) {
      return { href: lesson.practiceHref, label: "Try the numbers" };
    }
    if (lesson.practiceHref.startsWith("/learn/approach")) {
      return { href: lesson.practiceHref, label: "Practice this step" };
    }
    return { href: lesson.practiceHref, label: "Open practice" };
  }
  if (lesson.practiceStepIds?.[0]) {
    return {
      href: `/learn/from-zero/${lesson.practiceStepIds[0]}`,
      label: "Draw it",
    };
  }
  return null;
}

export function lessonHref(slug: string) {
  return `/learn/lessons/${slug}`;
}

export function firstLessonOfStage(stage: CourseStage) {
  return lessonsForStage(stage)[0];
}

export function relatedLessonFromPath(pathname: string): Lesson | undefined {
  const estimate = pathname.match(/\/learn\/estimate\/([^/]+)/);
  if (estimate) {
    const slug = estimate[1];
    if (slug === "units") return getLesson("units-and-rounding");
    if (slug === "latency") return getLesson("latency-orders");
    if (slug === "uptime") return getLesson("nines-of-uptime");
    return getLesson("napkin-qps");
  }
  const approach = pathname.match(/\/learn\/approach\/([^/]+)/);
  if (approach) {
    const map: Record<string, string> = {
      scope: "scope-the-hour",
      blueprint: "blueprint-and-buy-in",
      "deep-dive": "deep-dive-choices",
      wrap: "wrap-the-session",
    };
    return getLesson(map[approach[1] ?? ""] ?? "scope-the-hour");
  }
  return undefined;
}
