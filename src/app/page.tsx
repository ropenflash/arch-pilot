import {
  Deliverables,
  ExampleGrid,
  Hero,
  WhyArchPilot,
} from "@/components/dashboard/hero";
import { RecentDesigns } from "@/components/dashboard/recent-designs";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyArchPilot />
      <Deliverables />
      <ExampleGrid />
      <RecentDesigns />
    </>
  );
}
