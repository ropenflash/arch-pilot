import Link from "next/link";
import { listProjects } from "@/lib/projects/repository";
import { Button } from "@/components/ui/button";
import { ProjectActions } from "@/components/dashboard/project-actions";

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof listProjects>> = [];
  let error: string | null = null;
  try {
    projects = await listProjects();
  } catch {
    error = "Unable to load projects.";
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recent Designs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Saved architectures, including seeded examples.
          </p>
        </div>
        <Button asChild>
          <Link href="/design">Create System Design</Link>
        </Button>
      </div>
      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-8 text-sm text-red-200">
          {error}
        </p>
      ) : projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No projects yet. Generate an architecture or run{" "}
          <code>npx prisma db seed</code>.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link href={`/projects/${project.id}`} className="min-w-0">
                <p className="font-medium">{project.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
              </Link>
              <ProjectActions id={project.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
