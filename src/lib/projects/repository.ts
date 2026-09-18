import { prisma } from "@/lib/db/prisma";
import {
  architectureReviewSchema,
  systemDesignInputSchema,
  systemDesignSchema,
  type ArchitectureReview,
  type SystemDesign,
  type SystemDesignInput,
} from "@/lib/architecture/validation";
import { HttpError } from "@/lib/api/http";
import type { Prisma } from "@prisma/client";

function assertDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new HttpError(
      "INTERNAL_ERROR",
      "Database is not configured. Set DATABASE_URL to your Supabase pooler URL.",
      503,
    );
  }
}

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  input: SystemDesignInput;
  design: SystemDesign;
  review: ArchitectureReview | null;
  createdAt: string;
  updatedAt: string;
}

function parseProject(row: {
  id: string;
  name: string;
  description: string;
  input: Prisma.JsonValue;
  design: Prisma.JsonValue;
  review: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}): ProjectRecord {
  const input = systemDesignInputSchema.parse(row.input);
  const design = systemDesignSchema.parse(row.design);
  const review = row.review
    ? architectureReviewSchema.parse(row.review)
    : null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    input,
    design,
    review,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listProjects(): Promise<ProjectRecord[]> {
  assertDatabase();
  const rows = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(parseProject);
}

export async function getProject(id: string): Promise<ProjectRecord> {
  assertDatabase();
  const row = await prisma.project.findUnique({ where: { id } });
  if (!row) {
    throw new HttpError("NOT_FOUND", "Project not found.", 404);
  }
  return parseProject(row);
}

export async function createProject(data: {
  name: string;
  description: string;
  input: SystemDesignInput;
  design: SystemDesign;
  review?: ArchitectureReview | null;
}): Promise<ProjectRecord> {
  assertDatabase();
  const row = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      input: data.input as Prisma.InputJsonValue,
      design: data.design as Prisma.InputJsonValue,
      review: (data.review ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
  return parseProject(row);
}

export async function updateProject(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    input: SystemDesignInput;
    design: SystemDesign;
    review: ArchitectureReview | null;
  }>,
): Promise<ProjectRecord> {
  assertDatabase();
  await getProject(id);
  const row = await prisma.project.update({
    where: { id },
    data: {
      ...(data.name != null ? { name: data.name } : {}),
      ...(data.description != null ? { description: data.description } : {}),
      ...(data.input != null ? { input: data.input as Prisma.InputJsonValue } : {}),
      ...(data.design != null
        ? { design: data.design as Prisma.InputJsonValue }
        : {}),
      ...(data.review !== undefined
        ? { review: data.review as Prisma.InputJsonValue | undefined }
        : {}),
    },
  });
  return parseProject(row);
}

export async function deleteProject(id: string): Promise<void> {
  assertDatabase();
  await getProject(id);
  await prisma.project.delete({ where: { id } });
}

export async function duplicateProject(id: string): Promise<ProjectRecord> {
  const project = await getProject(id);
  return createProject({
    name: `${project.name} (Copy)`,
    description: project.description,
    input: project.input,
    design: project.design,
    review: project.review,
  });
}
