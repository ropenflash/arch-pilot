import { ExampleGrid, Hero } from "@/components/dashboard/hero";
import { RecentDesigns } from "@/components/dashboard/recent-designs";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ExampleGrid />
      <RecentDesigns />
    </>
  );
}
