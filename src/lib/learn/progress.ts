import { systemDesignSchema, type SystemDesign } from "@/lib/architecture/validation";

export const LEARN_PROGRESS_KEY = "archpilot.learn.from-zero.v1";
const LEARN_PROGRESS_EVENT = "archpilot-learn-progress";

export type LearnProgress = {
  stepId: string;
  completed: string[];
  design: SystemDesign | null;
  hints: Record<string, number>;
  quizAnswers: Record<string, string>;
};

const empty: LearnProgress = {
  stepId: "one-box",
  completed: [],
  design: null,
  hints: {},
  quizAnswers: {},
};

export function defaultLearnProgress(): LearnProgress {
  return {
    stepId: empty.stepId,
    completed: [],
    design: null,
    hints: {},
    quizAnswers: {},
  };
}

export function parseLearnProgress(value: unknown): LearnProgress {
  if (!value || typeof value !== "object") return defaultLearnProgress();
  const raw = value as Record<string, unknown>;
  let design: SystemDesign | null = null;
  if (raw.design) {
    const parsed = systemDesignSchema.safeParse(raw.design);
    if (parsed.success) design = parsed.data;
  }
  return {
    stepId: typeof raw.stepId === "string" ? raw.stepId : empty.stepId,
    completed: Array.isArray(raw.completed)
      ? raw.completed.filter((item): item is string => typeof item === "string")
      : [],
    design,
    hints:
      raw.hints && typeof raw.hints === "object"
        ? Object.fromEntries(
            Object.entries(raw.hints as Record<string, unknown>).filter(
              (entry): entry is [string, number] => typeof entry[1] === "number",
            ),
          )
        : {},
    quizAnswers:
      raw.quizAnswers && typeof raw.quizAnswers === "object"
        ? Object.fromEntries(
            Object.entries(raw.quizAnswers as Record<string, unknown>).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string",
            ),
          )
        : {},
  };
}

export function subscribeLearnProgress(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LEARN_PROGRESS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LEARN_PROGRESS_EVENT, onStoreChange);
  };
}

export function readLearnProgressSnapshot() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(LEARN_PROGRESS_KEY) ?? "";
  } catch {
    return "";
  }
}

export function loadLearnProgress(): LearnProgress {
  const raw = readLearnProgressSnapshot();
  if (!raw) return defaultLearnProgress();
  try {
    return parseLearnProgress(JSON.parse(raw));
  } catch {
    return defaultLearnProgress();
  }
}

export function saveLearnProgress(progress: LearnProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEARN_PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(LEARN_PROGRESS_EVENT));
}

export function clearLearnProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEARN_PROGRESS_KEY);
  window.dispatchEvent(new Event(LEARN_PROGRESS_EVENT));
}
