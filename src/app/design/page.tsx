import { Suspense } from "react";
import { DesignPageClient } from "@/components/design/design-page-client";

export default function DesignPage() {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-16 text-sm text-muted-foreground">Loading design studio…</p>
      }
    >
      <DesignPageClient />
    </Suspense>
  );
}
