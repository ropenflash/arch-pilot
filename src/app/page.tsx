import {
  ExampleGrid,
  Hero,
  LearningJourney,
  WhyArchPilot,
} from "@/components/dashboard/hero";
import { RecentDesigns } from "@/components/dashboard/recent-designs";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LearningJourney />
      <ExampleGrid />
      <WhyArchPilot />
      <RecentDesigns />
    </>
  );
}
