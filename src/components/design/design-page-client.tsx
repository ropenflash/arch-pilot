"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DesignForm } from "@/components/design/design-form";
import { DesignWorkspace } from "@/components/design/design-workspace";
import { createBlankDesign } from "@/lib/architecture/mutations";
import type { SystemDesign, SystemDesignInput } from "@/lib/architecture/validation";

function blankCanvasResult(): {
  input: SystemDesignInput;
  design: SystemDesign;
} {
  const name = "Untitled architecture";
  const design = createBlankDesign(name, "");
  return {
    input: {
      name,
      description: design.summary,
      requirements: { functional: [], nonFunctional: [] },
    },
    design,
  };
}

export function DesignPageClient() {
  const search = useSearchParams();
  const [result, setResult] = useState<{
    input: SystemDesignInput;
    design: SystemDesign;
  } | null>(() =>
    search.get("canvas") === "1" && !search.get("example")
      ? blankCanvasResult()
      : null,
  );

  if (!result) {
    return <DesignForm onGenerated={setResult} />;
  }

  return (
    <DesignWorkspace
      initialInput={result.input}
      initialDesign={result.design}
    />
  );
}
