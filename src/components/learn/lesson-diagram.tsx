import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/learn/syllabus";

const BOX =
  "rounded-lg border border-border bg-card px-3 py-2 text-center text-xs font-medium shadow-sm";

function Box({
  label,
  accent = false,
}: {
  label: string;
  accent?: boolean;
}) {
  return (
    <div className={cn(BOX, accent && "border-primary/50 bg-primary/10 text-foreground")}>
      {label}
    </div>
  );
}

function Arrow() {
  return <p className="text-center text-xs text-primary">↓</p>;
}

const DIAGRAMS: Record<Lesson["diagram"], { rows: string[][]; accent?: string }> = {
  single: { rows: [["Browser / mobile"], ["DNS → one app server"]], accent: "DNS → one app server" },
  split: { rows: [["Browser"], ["App server"], ["Private database"]] },
  fleet: { rows: [["Browser"], ["Load balancer"], ["App A + App B (private IPs)"]] },
  replica: { rows: [["App servers"], ["Primary DB  →  replica (reads)"]] },
  cache: { rows: [["App servers"], ["Cache"], ["Database"]] },
  cdn: { rows: [["Browser"], ["CDN (static)   ·   balancer (API)"], ["Object storage / origin"]] },
  stateless: { rows: [["Load balancer"], ["Any app server"], ["Shared session store"]] },
  regions: { rows: [["GeoDNS"], ["Region A   or   Region B"], ["Local DB + cache in each"]] },
  queue: { rows: [["Web servers (enqueue)"], ["Queue"], ["Workers"]] },
  shards: { rows: [["App servers"], ["Shard A   ·   Shard B   ·   Shard C"]] },
  ops: { rows: [["The running system"], ["Metrics · logs · traces · CI"]] },
};

export function LessonDiagram({ kind }: { kind: Lesson["diagram"] }) {
  const spec = DIAGRAMS[kind];
  return (
    <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-5">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        Topology
      </p>
      <div className="mx-auto flex max-w-sm flex-col gap-1.5">
        {spec.rows.map((row, index) => (
          <div key={row.join("-")}>
            {index > 0 ? <Arrow /> : null}
            <div className="flex flex-wrap justify-center gap-2">
              {row.map((label) => (
                <Box key={label} label={label} accent={label === spec.accent} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
