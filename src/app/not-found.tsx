import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Not found
      </p>
      <h1 className="mt-3 text-2xl font-semibold">This page is not available.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The lesson, challenge, or architecture may have moved or been deleted.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/learn">Learning map</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/design">Design a system</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
