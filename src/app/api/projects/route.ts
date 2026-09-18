import { errorFromUnknown, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import {
  formatZodError,
  systemDesignInputSchema,
  systemDesignSchema,
  architectureReviewSchema,
} from "@/lib/architecture/validation";
import { createProject, listProjects } from "@/lib/projects/repository";
import { sanitizePlainText } from "@/lib/utils/sanitize";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(20_000).default(""),
  input: systemDesignInputSchema,
  design: systemDesignSchema,
  review: architectureReviewSchema.nullable().optional(),
});

export async function GET() {
  try {
    const projects = await listProjects();
    return jsonOk({ projects });
  } catch (error) {
    return errorFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        "VALIDATION_ERROR",
        "Unable to save project.",
        400,
        formatZodError(parsed.error),
      );
    }
    const project = await createProject({
      name: sanitizePlainText(parsed.data.name, 200),
      description: sanitizePlainText(parsed.data.description, 20_000),
      input: parsed.data.input,
      design: parsed.data.design,
      review: parsed.data.review ?? null,
    });
    return jsonOk({ project }, 201);
  } catch (error) {
    return errorFromUnknown(error);
  }
}
