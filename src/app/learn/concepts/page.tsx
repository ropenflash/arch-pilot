import { redirect } from "next/navigation";
import { buildingBlockHref } from "@/lib/learn/building-blocks";

export default function ConceptsPage() {
  redirect(buildingBlockHref("dns"));
}
