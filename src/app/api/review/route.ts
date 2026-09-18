import { createAIProvider } from "@/lib/ai";
import { AIError } from "@/lib/ai/errors";
import { errorFromUnknown, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import {
  architectureReviewInputSchema,
  formatZodError,
} from "@/lib/architecture/validation";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const parsed = architectureReviewInputSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        "VALIDATION_ERROR",
        "Invalid architecture review input.",
        400,
        formatZodError(parsed.error),
      );
    }

    const provider = createAIProvider();
    const review = await provider.reviewArchitecture(parsed.data);
    return jsonOk({ review });
  } catch (error) {
    if (error instanceof AIError) {
      const status = error.code === "AI_PROVIDER_UNAVAILABLE" ? 503 : 422;
      return jsonError(error.code, error.message, status, error.details);
    }
    return errorFromUnknown(error);
  }
}
