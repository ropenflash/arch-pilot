export type ApiErrorCode =
  | "AI_PROVIDER_UNAVAILABLE"
  | "AI_GENERATION_FAILED"
  | "AI_PARSE_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "REQUEST_TOO_LARGE"
  | "INTERNAL_ERROR"
  | "SAVE_FAILED";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}
