import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ArchitectureReview } from "@/lib/architecture/validation";
import { PRODUCT } from "@/lib/content/product";

export function ReviewPanel({ review }: { review: ArchitectureReview | null }) {
  if (!review) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        {PRODUCT.reviewEmpty}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm leading-7 text-muted-foreground">{review.summary}</p>
      <div className="space-y-3">
        {review.findings.map((finding) => (
          <Card key={finding.title}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={finding.severity}>{finding.severity}</Badge>
                <Badge variant="outline">{finding.category}</Badge>
              </div>
              <CardTitle className="text-base">{finding.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{finding.explanation}</p>
              <p>
                <span className="text-foreground0">Recommendation · </span>
                {finding.recommendation}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <List title="Questions to consider" items={review.questionsToConsider} />
        <List title="Suggested improvements" items={review.suggestedImprovements} />
      </div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
