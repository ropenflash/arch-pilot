export class AIError extends Error {
  constructor(
    public readonly code:
      | "AI_PROVIDER_UNAVAILABLE"
      | "AI_GENERATION_FAILED"
      | "AI_PARSE_ERROR",
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AIError";
  }
}

export function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { code?: string; cause?: { code?: string }; message?: string };
  const code = maybe.code ?? maybe.cause?.code;
  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT"
  ) {
    return true;
  }
  return /fetch failed|econnrefused|not found|network/i.test(maybe.message ?? "");
}
