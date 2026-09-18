import { describe, expect, it } from "vitest";
import { MAX_REQUEST_BYTES } from "@/lib/api/http";
import { systemDesignInputSchema } from "@/lib/architecture/validation";

describe("API validation helpers", () => {
  it("enforces a request size budget", () => {
    expect(MAX_REQUEST_BYTES).toBe(512 * 1024);
  });

  it("requires a system name", () => {
    const parsed = systemDesignInputSchema.safeParse({
      name: "",
      description: "A reasonably long description of the system under design.",
      requirements: { functional: [], nonFunctional: [] },
    });
    expect(parsed.success).toBe(false);
  });
});
