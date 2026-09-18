"use client";

import { Button } from "@/components/ui/button";

export default function LearnError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Learning module unavailable
      </p>
      <h1 className="mt-3 text-2xl font-semibold">The lesson could not be loaded.</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Your local progress is still safe. Retry the module or return to the learning map.
      </p>
      <Button type="button" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
