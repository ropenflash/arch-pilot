"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DesignForm } from "@/components/design/design-form";
import { SimulatorLauncher } from "@/components/design/simulator-launcher";
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
  const [showCustom, setShowCustom] = useState(
    () => Boolean(search.get("example")) || search.get("custom") === "1",
  );
  const [result, setResult] = useState<{
    input: SystemDesignInput;
    design: SystemDesign;
  } | null>(() =>
    search.get("canvas") === "1" && !search.get("example")
      ? blankCanvasResult()
      : null,
  );

  if (!result) {
    if (!showCustom) {
      return <SimulatorLauncher onCustom={() => setShowCustom(true)} />;
    }
    return <DesignForm onGenerated={setResult} />;
  }

  return (
    <DesignWorkspace
      initialInput={result.input}
      initialDesign={result.design}
    />
  );
}
