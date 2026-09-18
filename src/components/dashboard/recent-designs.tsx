import Link from "next/link";
import { listProjects } from "@/lib/projects/repository";

export async function RecentDesigns() {
  let projects: Awaited<ReturnType<typeof listProjects>> = [];
  try {
    projects = await listProjects();
  } catch {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="mb-4 text-lg font-medium">Recent Designs</h2>
        <p className="rounded-xl border border-border px-4 py-8 text-sm text-muted-foreground">
          Unable to load projects. Check that PostgreSQL is running and
          <code className="mx-1 rounded bg-muted px-1">DATABASE_URL</code>
          is set.
        </p>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="mb-4 text-lg font-medium">Recent Designs</h2>
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
          No projects yet. Generate a design or seed examples with{" "}
          <code className="rounded bg-muted px-1">npx prisma db seed</code>.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <h2 className="mb-4 text-lg font-medium">Recent Designs</h2>
      <div className="divide-y divide-border rounded-xl border border-border">
        {projects.slice(0, 8).map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/60"
          >
            <div>
              <p className="text-sm font-medium">{project.name}</p>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {project.description}
              </p>
            </div>
            <span className="shrink-0 text-xs text-foreground0">
              {new Date(project.updatedAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
