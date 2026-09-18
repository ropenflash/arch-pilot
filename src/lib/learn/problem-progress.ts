import {
  systemDesignSchema,
  type SystemDesign,
} from "@/lib/architecture/validation";

const KEY = "archpilot.learn.problems.v1";
const EVENT = "archpilot-learn-problems";

export type ProblemProgress = {
  completed: string[];
  designs: Record<string, SystemDesign>;
};

export function defaultProblemProgress(): ProblemProgress {
  return { completed: [], designs: {} };
}

export function parseProblemProgress(value: unknown): ProblemProgress {
  if (!value || typeof value !== "object") return defaultProblemProgress();
  const raw = value as Record<string, unknown>;
  const designs: Record<string, SystemDesign> = {};
  if (raw.designs && typeof raw.designs === "object") {
    for (const [id, design] of Object.entries(
      raw.designs as Record<string, unknown>,
    )) {
      const parsed = systemDesignSchema.safeParse(design);
      if (parsed.success) designs[id] = parsed.data;
    }
  }
  return {
    completed: Array.isArray(raw.completed)
      ? raw.completed.filter((item): item is string => typeof item === "string")
      : [],
    designs,
  };
}

export function subscribeProblemProgress(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(EVENT, onStoreChange);
  };
}

export function readProblemProgressSnapshot() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveProblemProgress(progress: ProblemProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(EVENT));
}
