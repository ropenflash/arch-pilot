import { createAIProvider, getProviderStatus } from "@/lib/ai";
import { AIError } from "@/lib/ai/errors";
import { errorFromUnknown, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import {
  formatZodError,
  systemDesignInputSchema,
} from "@/lib/architecture/validation";
import { sanitizePlainText, sanitizeStringList } from "@/lib/utils/sanitize";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const parsed = systemDesignInputSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        "VALIDATION_ERROR",
        "Invalid system design input.",
        400,
        formatZodError(parsed.error),
      );
    }

    const input = {
      ...parsed.data,
      name: sanitizePlainText(parsed.data.name, 200),
      description: sanitizePlainText(parsed.data.description, 20_000),
      requirements: {
        functional: sanitizeStringList(parsed.data.requirements.functional),
        nonFunctional: sanitizeStringList(parsed.data.requirements.nonFunctional),
      },
    };

    const provider = createAIProvider();
    const design = await provider.generateSystemDesign(input);
    return jsonOk({ design, input });
  } catch (error) {
    if (error instanceof AIError) {
      const status = error.code === "AI_PROVIDER_UNAVAILABLE" ? 503 : 422;
      return jsonError(error.code, error.message, status, error.details);
    }
    return errorFromUnknown(error);
  }
}

export async function GET() {
  try {
    const status = await getProviderStatus();
    return jsonOk(status);
  } catch (error) {
    return errorFromUnknown(error);
  }
}
