import type { Metadata } from "next";
import { ShardingPlayground } from "@/components/learn/sharding-playground";

export const metadata: Metadata = {
  title: "Sharding and consistent hashing playground",
  description:
    "Route sample users with modulo sharding, create hotspots, and see key movement on a consistent hash ring.",
};

export default function ShardingLabPage() {
  return <ShardingPlayground />;
}
