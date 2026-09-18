const KEY = "archpilot.learn.problems.v1";
const EVENT = "archpilot-learn-problems";

export type ProblemProgress = {
  completed: string[];
};

export function defaultProblemProgress(): ProblemProgress {
  return { completed: [] };
}

export function parseProblemProgress(value: unknown): ProblemProgress {
  if (!value || typeof value !== "object") return defaultProblemProgress();
  const raw = value as Record<string, unknown>;
  return {
    completed: Array.isArray(raw.completed)
      ? raw.completed.filter((item): item is string => typeof item === "string")
      : [],
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
