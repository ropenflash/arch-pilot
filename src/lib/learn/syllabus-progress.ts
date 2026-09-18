const SYLLABUS_PROGRESS_KEY = "archpilot.learn.syllabus.v1";
const SYLLABUS_PROGRESS_EVENT = "archpilot-learn-syllabus";

export type SyllabusProgress = {
  completed: string[];
  answers: Record<string, string>;
};

export function defaultSyllabusProgress(): SyllabusProgress {
  return { completed: [], answers: {} };
}

export function parseSyllabusProgress(value: unknown): SyllabusProgress {
  if (!value || typeof value !== "object") return defaultSyllabusProgress();
  const raw = value as Record<string, unknown>;
  return {
    completed: Array.isArray(raw.completed)
      ? raw.completed.filter((item): item is string => typeof item === "string")
      : [],
    answers:
      raw.answers && typeof raw.answers === "object"
        ? Object.fromEntries(
            Object.entries(raw.answers as Record<string, unknown>).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string",
            ),
          )
        : {},
  };
}

export function subscribeSyllabusProgress(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SYLLABUS_PROGRESS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SYLLABUS_PROGRESS_EVENT, onStoreChange);
  };
}

export function readSyllabusProgressSnapshot() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(SYLLABUS_PROGRESS_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveSyllabusProgress(progress: SyllabusProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SYLLABUS_PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(SYLLABUS_PROGRESS_EVENT));
}
