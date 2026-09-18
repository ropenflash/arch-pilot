import { notFound } from "next/navigation";
import { DesignWorkspace } from "@/components/design/design-workspace";
import { getProject } from "@/lib/projects/repository";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let project;
  try {
    project = await getProject(id);
  } catch {
    notFound();
  }

  return (
    <DesignWorkspace
      projectId={project.id}
      initialInput={project.input}
      initialDesign={project.design}
      initialReview={project.review}
    />
  );
}
