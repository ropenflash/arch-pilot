import {
  architectureReviewSchema,
  formatZodError,
  systemDesignSchema,
  type ArchitectureReview,
  type SystemDesign,
} from "@/lib/architecture/validation";

export function extractJson(text: string): unknown {
  if (!text || !text.trim()) {
    throw new Error("Empty model response");
  }

  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  const attempts = [candidate];
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    attempts.push(candidate.slice(firstBrace, lastBrace + 1));
  }

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    lastError instanceof Error
      ? `Malformed JSON: ${lastError.message}`
      : "Malformed JSON",
  );
}

export function parseSystemDesignOutput(text: string): {
  success: boolean;
  data?: SystemDesign;
  error?: string;
  issues?: string;
  raw?: unknown;
} {
  try {
    const raw = extractJson(text);
    const parsed = systemDesignSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Unable to parse architecture.",
        issues: formatZodError(parsed.error),
        raw,
      };
    }
    return { success: true, data: parsed.data, raw };
  } catch (error) {
    return {
      success: false,
      error: "Unable to parse architecture.",
      issues: error instanceof Error ? error.message : "Malformed JSON",
    };
  }
}

export function parseArchitectureReviewOutput(text: string): {
  success: boolean;
  data?: ArchitectureReview;
  error?: string;
  issues?: string;
  raw?: unknown;
} {
  try {
    const raw = extractJson(text);
    const parsed = architectureReviewSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Unable to parse architecture review.",
        issues: formatZodError(parsed.error),
        raw,
      };
    }
    return { success: true, data: parsed.data, raw };
  } catch (error) {
    return {
      success: false,
      error: "Unable to parse architecture review.",
      issues: error instanceof Error ? error.message : "Malformed JSON",
    };
  }
}
