"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DesignError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Design studio unavailable
      </p>
      <h1 className="mt-3 text-2xl font-semibold">Your studio could not be opened.</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Retry without losing saved projects, or choose another guided system.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="secondary">
          <Link href="/learn#designs">Choose a system</Link>
        </Button>
      </div>
    </div>
  );
}
