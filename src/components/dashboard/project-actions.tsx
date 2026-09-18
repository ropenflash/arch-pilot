"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ProjectActions({ id }: { id: string }) {
  const router = useRouter();

  async function remove() {
    const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete design.");
      return;
    }
    toast.success("Design deleted.");
    router.refresh();
  }

  async function duplicate() {
    const response = await fetch(`/api/projects/${id}?action=duplicate`, {
      method: "POST",
    });
    if (!response.ok) {
      toast.error("Unable to duplicate design.");
      return;
    }
    toast.success("Design duplicated.");
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" asChild>
        <Link href={`/design/${id}`}>Share</Link>
      </Button>
      <Button variant="secondary" size="sm" onClick={duplicate}>
        Duplicate
      </Button>
      <Button variant="outline" size="sm" onClick={remove}>
        Delete
      </Button>
    </div>
  );
}
