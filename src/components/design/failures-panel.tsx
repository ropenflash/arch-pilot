import type { SystemDesign } from "@/lib/architecture/validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FailuresPanel({ design }: { design: SystemDesign }) {
  return (
    <div className="space-y-4">
      {design.failureScenarios.length === 0 ? (
        <p className="text-sm text-muted-foreground">No failure scenarios generated.</p>
      ) : (
        design.failureScenarios.map((item) => (
          <Card key={item.scenario}>
            <CardHeader>
              <CardTitle>{item.scenario}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-2">
              <Field label="Impact" value={item.impact} />
              <Field label="Detection" value={item.detection} />
              <Field label="Mitigation" value={item.mitigation} />
              <Field label="Recovery" value={item.recovery} />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-foreground0">{label}</p>
      <p className="mt-1 leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

export function SecurityPanel({ design }: { design: SystemDesign }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
      {design.securityConsiderations.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function ObservabilityPanel({ design }: { design: SystemDesign }) {
  const groups = [
    { title: "Metrics", items: design.observability.metrics },
    { title: "Logs", items: design.observability.logs },
    { title: "Traces", items: design.observability.traces },
    { title: "Alerts", items: design.observability.alerts },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {groups.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
