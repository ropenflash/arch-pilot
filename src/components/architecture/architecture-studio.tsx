"use client";

import { useMemo, useState } from "react";
import { ArchitectureDetailPanel } from "@/components/architecture/detail-panel";
import type { CanvasSelection } from "@/components/architecture/canvas-selection";
import { ArchitectureDiagram } from "@/components/diagrams/architecture-diagram";
import { collectComponents } from "@/lib/architecture/graph";
import type { SystemDesign } from "@/lib/architecture/validation";

function resolveSelection(
  design: SystemDesign,
  selection: CanvasSelection | null,
): CanvasSelection | null {
  if (!selection) return null;
  if (selection.kind === "node") {
    return collectComponents(design).some((item) => item.id === selection.id)
      ? selection
      : null;
  }
  return design.architectureEdges.some(
    (edge) => edge.from === selection.from && edge.to === selection.to,
  )
    ? selection
    : null;
}

export function ArchitectureStudio({
  design,
  onDesignChange,
  readOnly = false,
  canvasKey,
}: {
  design: SystemDesign;
  onDesignChange?: (design: SystemDesign) => void;
  readOnly?: boolean;
  canvasKey?: string | number;
}) {
  const [selection, setSelection] = useState<CanvasSelection | null>(null);
  const activeSelection = useMemo(
    () => resolveSelection(design, selection),
    [design, selection],
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="min-w-0 flex-1">
        <ArchitectureDiagram
          design={design}
          onSelect={setSelection}
          onDesignChange={onDesignChange}
          readOnly={readOnly}
          canvasKey={canvasKey}
        />
      </div>
      <ArchitectureDetailPanel
        design={design}
        selection={activeSelection}
        onClose={() => setSelection(null)}
        onDesignChange={onDesignChange}
        readOnly={readOnly}
      />
    </div>
  );
}
