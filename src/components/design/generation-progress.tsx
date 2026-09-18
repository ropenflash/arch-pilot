"use client";

import { useEffect, useState } from "react";

import { PRODUCT } from "@/lib/content/product";

const STEPS = PRODUCT.generationSteps;

export function GenerationProgress() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % STEPS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-muted/60 p-4">
      <p className="text-sm text-foreground">{STEPS[index]}</p>
      <div className="mt-3 flex gap-1">
        {STEPS.map((step, i) => (
          <span
            key={step}
            className={`h-1 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
