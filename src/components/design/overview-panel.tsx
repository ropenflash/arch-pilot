import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SystemDesign, SystemDesignInput } from "@/lib/architecture/validation";

export function OverviewPanel({
  design,
  input,
}: {
  design: SystemDesign;
  input: SystemDesignInput;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-foreground">{design.summary}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {design.assumptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No explicit assumptions.</p>
          ) : (
            design.assumptions.map((item) => (
              <div key={item.name}>
                <p className="text-xs text-foreground0">{item.name}</p>
                <p className="text-sm text-foreground">{item.value}</p>
                {item.rationale ? (
                  <p className="text-xs text-muted-foreground">{item.rationale}</p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Functional requirements</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {(design.requirements.functional.length
            ? design.requirements.functional
            : input.requirements.functional
          ).map((item) => (
            <Badge key={item}>{item}</Badge>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Non-functional requirements</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {(design.requirements.nonFunctional.length
            ? design.requirements.nonFunctional
            : input.requirements.nonFunctional
          ).map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Scaling strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {design.scalingStrategy.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
