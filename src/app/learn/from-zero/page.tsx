import { Suspense } from "react";
import { ChallengeStudio } from "@/components/learn/challenge-studio";

export default function FromZeroPage() {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-16 text-sm text-muted-foreground">
          Loading the round…
        </p>
      }
    >
      <ChallengeStudio />
    </Suspense>
  );
}
