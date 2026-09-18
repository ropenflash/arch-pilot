const KEY = "archpilot.learn.platform.v1";
const EVENT = "archpilot-learn-platform-progress";

export type QuizAttempt = {
  correct: boolean;
  area: "foundations" | "scalability" | "distributed" | "interview";
};

export type PlatformProgress = {
  concepts: string[];
  exercises: string[];
  quizAttempts: Record<string, QuizAttempt>;
};

export function defaultPlatformProgress(): PlatformProgress {
  return { concepts: [], exercises: [], quizAttempts: {} };
}

export function parsePlatformProgress(value: unknown): PlatformProgress {
  if (!value || typeof value !== "object") return defaultPlatformProgress();
  const raw = value as Record<string, unknown>;
  const attempts: Record<string, QuizAttempt> = {};
  if (raw.quizAttempts && typeof raw.quizAttempts === "object") {
    for (const [id, attempt] of Object.entries(
      raw.quizAttempts as Record<string, unknown>,
    )) {
      if (!attempt || typeof attempt !== "object") continue;
      const item = attempt as Record<string, unknown>;
      const area = item.area;
      if (
        typeof item.correct === "boolean" &&
        (area === "foundations" ||
          area === "scalability" ||
          area === "distributed" ||
          area === "interview")
      ) {
        attempts[id] = { correct: item.correct, area };
      }
    }
  }
  return {
    concepts: Array.isArray(raw.concepts)
      ? [...new Set(raw.concepts.filter((item): item is string => typeof item === "string"))]
      : [],
    exercises: Array.isArray(raw.exercises)
      ? [...new Set(raw.exercises.filter((item): item is string => typeof item === "string"))]
      : [],
    quizAttempts: attempts,
  };
}

export function subscribePlatformProgress(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(EVENT, onStoreChange);
  };
}

export function readPlatformProgressSnapshot() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function savePlatformProgress(progress: PlatformProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(EVENT));
}

export function loadPlatformProgress() {
  const snapshot = readPlatformProgressSnapshot();
  if (!snapshot) return defaultPlatformProgress();
  try {
    return parsePlatformProgress(JSON.parse(snapshot));
  } catch {
    return defaultPlatformProgress();
  }
}

export function recordConcept(id: string) {
  const progress = loadPlatformProgress();
  savePlatformProgress({
    ...progress,
    concepts: [...new Set([...progress.concepts, id])],
  });
}

export function recordExercise(id: string) {
  const progress = loadPlatformProgress();
  savePlatformProgress({
    ...progress,
    exercises: [...new Set([...progress.exercises, id])],
  });
}

export function recordQuiz(
  id: string,
  attempt: QuizAttempt,
) {
  const progress = loadPlatformProgress();
  savePlatformProgress({
    ...progress,
    quizAttempts: { ...progress.quizAttempts, [id]: attempt },
  });
}
