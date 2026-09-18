"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArchitectureDiagram } from "@/components/diagrams/architecture-diagram";
import { ArchitectureDetailPanel } from "@/components/architecture/detail-panel";
import { ApisPanel } from "@/components/design/apis-panel";
import { CapacityPanel } from "@/components/design/capacity-panel";
import { DataModelPanel } from "@/components/design/data-model-panel";
import { FailuresPanel, ObservabilityPanel, SecurityPanel } from "@/components/design/failures-panel";
import { OverviewPanel } from "@/components/design/overview-panel";
import { ReviewPanel } from "@/components/design/review-panel";
import { ServicesPanel } from "@/components/design/services-panel";
import { TechnologyDecisions, TradeoffsPanel } from "@/components/design/tradeoffs-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ArchitectureReview,
  SystemDesign,
  SystemDesignInput,
} from "@/lib/architecture/validation";
import { downloadBlob } from "@/lib/utils";
import {
  Copy,
  Download,
  RefreshCw,
  Save,
  Share2,
  Sparkles,
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "capacity", label: "Capacity" },
  { id: "services", label: "Services" },
  { id: "data-model", label: "Data Model" },
  { id: "apis", label: "APIs" },
  { id: "trade-offs", label: "Trade-offs" },
  { id: "failures", label: "Failures" },
  { id: "security", label: "Security" },
  { id: "observability", label: "Observability" },
  { id: "review", label: "AI Review" },
] as const;

export function DesignWorkspace({
  projectId,
  initialInput,
  initialDesign,
  initialReview = null,
  readOnly = false,
}: {
  projectId?: string;
  initialInput: SystemDesignInput;
  initialDesign: SystemDesign;
  initialReview?: ArchitectureReview | null;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [input, setInput] = useState(initialInput);
  const [design, setDesign] = useState(initialDesign);
  const [review, setReview] = useState(initialReview);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [id, setId] = useState(projectId);

  async function regenerate() {
    setBusy("regenerate");
    try {
      const response = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error?.message ?? "Unable to generate architecture.");
        return;
      }
      setInput(data.input);
      setDesign(data.design);
      setReview(null);
      toast.success("Architecture regenerated.");
    } finally {
      setBusy(null);
    }
  }

  async function runReview() {
    setBusy("review");
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, design }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error?.message ?? "Unable to review architecture.");
        return;
      }
      setReview(data.review);
      if (id) {
        await fetch(`/api/projects/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review: data.review }),
        });
      }
      toast.success("Review complete.");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy("save");
    try {
      const payload = {
        name: design.title,
        description: design.summary,
        input,
        design,
        review,
      };
      const response = await fetch(id ? `/api/projects/${id}` : "/api/projects", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error?.message ?? "Unable to save project.");
        return;
      }
      setId(data.project.id);
      toast.success("Design saved.");
      router.push(`/projects/${data.project.id}`);
    } finally {
      setBusy(null);
    }
  }

  async function share() {
    const shareId = id;
    if (!shareId) {
      await save();
      return;
    }
    const url = `${window.location.origin}/design/${shareId}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied.");
  }

  function exportJson() {
    downloadBlob(
      `${design.title.replace(/\s+/g, "-").toLowerCase()}.json`,
      JSON.stringify({ input, design, review }, null, 2),
      "application/json",
    );
  }

  async function duplicate() {
    if (!id) return;
    setBusy("duplicate");
    try {
      const response = await fetch(`/api/projects/${id}?action=duplicate`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error("Unable to duplicate design.");
        return;
      }
      router.push(`/projects/${data.project.id}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">System design</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{design.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{design.summary}</p>
        </div>
        {!readOnly ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={regenerate} disabled={!!busy}>
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </Button>
            <Button variant="secondary" size="sm" onClick={save} disabled={!!busy}>
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
            <Button variant="secondary" size="sm" onClick={share} disabled={!!busy}>
              <Share2 className="h-3.5 w-3.5" />
              Share Architecture
            </Button>
            <Button variant="secondary" size="sm" onClick={exportJson}>
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            {id ? (
              <Button variant="secondary" size="sm" onClick={duplicate} disabled={!!busy}>
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </Button>
            ) : null}
            <Button size="sm" onClick={runReview} disabled={!!busy}>
              <Sparkles className="h-3.5 w-3.5" />
              {busy === "review" ? "Reviewing..." : "Review Architecture"}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={exportJson}>
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        )}
      </div>

      <Tabs defaultValue="architecture">
        <TabsList className="h-auto w-full flex-wrap justify-start">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <OverviewPanel design={design} input={input} />
        </TabsContent>
        <TabsContent value="architecture">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="min-w-0 flex-1">
              <ArchitectureDiagram design={design} onSelect={setSelectedId} />
            </div>
            <ArchitectureDetailPanel
              design={design}
              selectedId={selectedId}
              onClose={() => setSelectedId(null)}
            />
          </div>
        </TabsContent>
        <TabsContent value="capacity">
          <CapacityPanel design={design} input={input} />
        </TabsContent>
        <TabsContent value="services">
          <ServicesPanel design={design} />
        </TabsContent>
        <TabsContent value="data-model">
          <DataModelPanel design={design} />
        </TabsContent>
        <TabsContent value="apis">
          <ApisPanel design={design} />
        </TabsContent>
        <TabsContent value="trade-offs">
          <div className="space-y-8">
            <TechnologyDecisions design={design} />
            <TradeoffsPanel design={design} />
          </div>
        </TabsContent>
        <TabsContent value="failures">
          <FailuresPanel design={design} />
        </TabsContent>
        <TabsContent value="security">
          <SecurityPanel design={design} />
        </TabsContent>
        <TabsContent value="observability">
          <ObservabilityPanel design={design} />
        </TabsContent>
        <TabsContent value="review">
          <ReviewPanel review={review} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
