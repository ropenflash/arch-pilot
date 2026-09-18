import type { SystemDesign } from "@/lib/architecture/validation";

export function DataModelPanel({ design }: { design: SystemDesign }) {
  if (design.dataModel.length === 0) {
    return <Empty text="No data model was generated." />;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {design.dataModel.map((entity) => (
        <div key={entity.name} className="rounded-xl border border-border bg-zinc-950 p-4 font-mono text-sm">
          <p className="font-sans text-sm font-medium text-zinc-100">{entity.name}</p>
          {entity.description ? (
            <p className="mt-1 font-sans text-xs text-muted-foreground">{entity.description}</p>
          ) : null}
          <div className="mt-3 space-y-1 text-zinc-300">
            {entity.fields.map((field) => (
              <p key={field.name}>
                ├── {field.name}
                <span className="text-zinc-600"> : {field.type}</span>
              </p>
            ))}
          </div>
          {entity.relationships.length ? (
            <div className="mt-3 font-sans text-xs text-zinc-500">
              {entity.relationships.map((rel) => (
                <p key={`${rel.target}-${rel.type}`}>
                  {rel.type} → {rel.target}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}
