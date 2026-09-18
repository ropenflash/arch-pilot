import { collectComponents } from "@/lib/architecture/graph";
import type { SystemDesign } from "@/lib/architecture/validation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ServicesPanel({ design }: { design: SystemDesign }) {
  const components = collectComponents(design);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {components.map((component) => (
        <Card key={component.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle>{component.name}</CardTitle>
              <Badge variant="outline">{component.type.replaceAll("_", " ")}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{component.technology}</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{component.description}</p>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-foreground0">
                Responsibilities
              </p>
              <ul className="mt-1 list-disc pl-4">
                {component.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p>
              <span className="text-foreground0">Scaling · </span>
              {component.scalingStrategy}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
