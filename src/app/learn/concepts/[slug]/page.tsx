import { notFound } from "next/navigation";
import { BuildingBlockStudio } from "@/components/learn/building-block-studio";
import { BUILDING_BLOCKS, getBuildingBlock } from "@/lib/learn/building-blocks";

export function generateStaticParams() {
  return BUILDING_BLOCKS.map((block) => ({ slug: block.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const block = getBuildingBlock(slug);
  return {
    title: block ? `${block.title} — System design building block` : "Building block",
    description: block?.oneLine,
  };
}

export default async function BuildingBlockPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const block = getBuildingBlock(slug);
  if (!block) notFound();
  return <BuildingBlockStudio key={block.id} block={block} />;
}
