"use client";

import { useState } from "react";
import { DesignForm } from "@/components/design/design-form";
import { DesignWorkspace } from "@/components/design/design-workspace";
import type { SystemDesign, SystemDesignInput } from "@/lib/architecture/validation";

export function DesignPageClient() {
  const [result, setResult] = useState<{
    input: SystemDesignInput;
    design: SystemDesign;
  } | null>(null);

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
