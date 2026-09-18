import type { SystemDesign } from "@/lib/architecture/validation";
import { Badge } from "@/components/ui/badge";

export function ApisPanel({ design }: { design: SystemDesign }) {
  if (design.apis.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        No APIs were generated.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {design.apis.map((api) => (
        <article key={`${api.method}-${api.path}`} className="rounded-xl border border-border p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{api.method}</Badge>
            <code className="text-sm text-foreground">{api.path}</code>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{api.description}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Block title="Request" value={api.request} />
            <Block title="Response" value={api.response} />
          </div>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-foreground0">Authentication · </span>
              {api.authentication || "—"}
            </p>
            <p>
              <span className="text-foreground0">Idempotency · </span>
              {api.idempotency || "—"}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

function Block({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-foreground0">{title}</p>
      <pre className="mt-1 overflow-x-auto rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
        {value == null ? "—" : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
