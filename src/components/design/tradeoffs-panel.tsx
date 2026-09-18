import type { SystemDesign } from "@/lib/architecture/validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TradeoffsPanel({ design }: { design: SystemDesign }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium">Architecture Trade-offs</h2>
      {design.tradeoffs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No trade-offs recorded.</p>
      ) : (
        design.tradeoffs.map((item) => (
          <Card key={item.decision}>
            <CardHeader>
              <p className="text-[11px] uppercase tracking-wider text-foreground0">Decision</p>
              <CardTitle className="text-base">{item.decision}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-foreground0">Benefit</p>
                <p className="mt-1 text-muted-foreground">{item.benefit}</p>
              </div>
              <div>
                <p className="text-foreground0">Cost</p>
                <p className="mt-1 text-muted-foreground">{item.cost}</p>
              </div>
              <div>
                <p className="text-foreground0">When to reconsider</p>
                <p className="mt-1 text-muted-foreground">{item.whenToReconsider}</p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export function TechnologyDecisions({ design }: { design: SystemDesign }) {
  if (!design.technologyDecisions.length) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium">Technology Decisions</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {design.technologyDecisions.map((item) => (
          <Card key={item.technology}>
            <CardHeader>
              <CardTitle>{item.technology}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-foreground0">Why: </span>
                {item.why}
              </p>
              <p>
                <span className="text-foreground0">Alternative: </span>
                {item.alternative}
              </p>
              <p>
                <span className="text-foreground0">Why not: </span>
                {item.whyNot}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
