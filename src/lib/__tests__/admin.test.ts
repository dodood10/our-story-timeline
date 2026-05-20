import { describe, expect, it } from "vitest";
import { isAdminFromAppMetadata } from "@/lib/admin-auth";
import { applyRevokeForProductKey } from "@/lib/entitlements.server";

describe("isAdminFromAppMetadata", () => {
  it("retorna true para role admin", () => {
    expect(isAdminFromAppMetadata({ role: "admin" })).toBe(true);
  });

  it("retorna false sem role ou outro valor", () => {
    expect(isAdminFromAppMetadata({})).toBe(false);
    expect(isAdminFromAppMetadata({ role: "user" })).toBe(false);
    expect(isAdminFromAppMetadata(undefined)).toBe(false);
  });
});

describe("applyRevokeForProductKey", () => {
  const base = {
    surpriseTier: "premium" as const,
    subscription: {
      status: "active" as const,
      startedAt: "2026-01-01T00:00:00.000Z",
      currentPeriodEnd: "2027-01-01T00:00:00.000Z",
      autoRenew: false,
      renewals: 1,
    },
  };

  it("revoga premium", () => {
    expect(applyRevokeForProductKey(base, "surprise:premium").surpriseTier).toBe("none");
    expect(applyRevokeForProductKey(base, "surprise:premium").subscription).toEqual(
      base.subscription,
    );
  });

  it("revoga memory_lane", () => {
    expect(applyRevokeForProductKey(base, "memory_lane").subscription).toBeNull();
    expect(applyRevokeForProductKey(base, "memory_lane").surpriseTier).toBe("premium");
  });

  it("basic não rebaixa premium", () => {
    expect(applyRevokeForProductKey(base, "surprise:basic").surpriseTier).toBe("premium");
  });
});
