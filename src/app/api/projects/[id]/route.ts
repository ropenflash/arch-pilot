import { errorFromUnknown, jsonError, jsonOk, readJsonBody } from "@/lib/api/http";
import {
  architectureReviewSchema,
  formatZodError,
  systemDesignInputSchema,
  systemDesignSchema,
} from "@/lib/architecture/validation";
import {
  deleteProject,
  duplicateProject,
  getProject,
  updateProject,
} from "@/lib/projects/repository";
import { sanitizePlainText } from "@/lib/utils/sanitize";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(20_000).optional(),
  input: systemDesignInputSchema.optional(),
  design: systemDesignSchema.optional(),
  review: architectureReviewSchema.nullable().optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const project = await getProject(id);
    return jsonOk({ project });
  } catch (error) {
    return errorFromUnknown(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await readJsonBody(request);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        "VALIDATION_ERROR",
        "Unable to save project.",
        400,
        formatZodError(parsed.error),
      );
    }
    const project = await updateProject(id, {
      ...parsed.data,
      name: parsed.data.name
        ? sanitizePlainText(parsed.data.name, 200)
        : undefined,
      description:
        parsed.data.description != null
          ? sanitizePlainText(parsed.data.description, 20_000)
          : undefined,
    });
    return jsonOk({ project });
  } catch (error) {
    return errorFromUnknown(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await deleteProject(id);
    return jsonOk({ ok: true });
  } catch (error) {
    return errorFromUnknown(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    if (url.searchParams.get("action") === "duplicate") {
      const project = await duplicateProject(id);
      return jsonOk({ project }, 201);
    }
    return jsonError("VALIDATION_ERROR", "Unsupported action.", 400);
  } catch (error) {
    return errorFromUnknown(error);
  }
}
