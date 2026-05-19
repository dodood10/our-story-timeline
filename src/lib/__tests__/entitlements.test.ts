import { describe, expect, it } from "vitest";
import { mergeSurpriseTier } from "@/lib/entitlements.server";

describe("mergeSurpriseTier", () => {
  it("mantém premium quando já é premium", () => {
    expect(mergeSurpriseTier("premium", "basic")).toBe("premium");
    expect(mergeSurpriseTier("premium", "premium")).toBe("premium");
  });

  it("sobe para premium", () => {
    expect(mergeSurpriseTier("none", "premium")).toBe("premium");
    expect(mergeSurpriseTier("basic", "premium")).toBe("premium");
  });

  it("define basic se ainda não tem premium", () => {
    expect(mergeSurpriseTier("none", "basic")).toBe("basic");
    expect(mergeSurpriseTier("basic", "basic")).toBe("basic");
  });

  it("não rebaixa premium para basic", () => {
    expect(mergeSurpriseTier("premium", "basic")).toBe("premium");
  });
});
