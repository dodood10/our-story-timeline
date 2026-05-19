import { describe, expect, it } from "vitest";
import { deriveProductMode, type SurpriseTier } from "@/lib/access-purchase";
import {
  cancelSubscription,
  deriveSubscriptionUiState,
  isSubscriptionActive,
  parseSubscription,
  reactivateSubscription,
  renewSubscription,
  startSubscription,
  tickSubscription,
} from "@/lib/memory-lane-subscription";

describe("deriveProductMode", () => {
  it("maps surprise tiers with no memory lane", () => {
    expect(deriveProductMode("none", null)).toBe("none");
    expect(deriveProductMode("basic", null)).toBe("surprise_only");
    expect(deriveProductMode("premium", null)).toBe("surprise_only");
  });

  it("treats an active subscription as memory lane access", () => {
    const sub = startSubscription();
    expect(deriveProductMode("none", sub)).toBe("memory_lane_only");
    expect(deriveProductMode("premium", sub)).toBe("both");
  });

  it("expired subscription does not grant memory lane access", () => {
    const sub = startSubscription();
    const expired = { ...sub, currentPeriodEnd: new Date(Date.now() - 1000).toISOString() };
    expect(deriveProductMode("premium", expired)).toBe("surprise_only");
  });

  it("accepts legacy boolean form for backward compatibility", () => {
    expect(deriveProductMode("none", true)).toBe("memory_lane_only");
    expect(deriveProductMode("none", false)).toBe("none");
  });
});

/** Espelha o resultado de applyPurchaseToStorage (sem localStorage em vitest). */
function modeAfterPurchase(opts: {
  surpriseTier?: Exclude<SurpriseTier, "none">;
  memoryLaneOnly?: boolean;
}): ReturnType<typeof deriveProductMode> {
  if (opts.memoryLaneOnly) return deriveProductMode("none", startSubscription());
  if (opts.surpriseTier) return deriveProductMode(opts.surpriseTier, null);
  return "none";
}

describe("applyPurchase rules", () => {
  it("surprise only does not enable memory lane", () => {
    expect(modeAfterPurchase({ surpriseTier: "basic" })).toBe("surprise_only");
  });

  it("memory lane only clears surprise", () => {
    expect(modeAfterPurchase({ memoryLaneOnly: true })).toBe("memory_lane_only");
  });
});

describe("subscription lifecycle", () => {
  it("starts as active with 30-day period and renewals=1", () => {
    const sub = startSubscription();
    expect(sub.status).toBe("active");
    expect(sub.autoRenew).toBe(true);
    expect(sub.renewals).toBe(1);
    expect(isSubscriptionActive(sub)).toBe(true);
  });

  it("cancel keeps access but turns off autoRenew", () => {
    const sub = cancelSubscription(startSubscription());
    expect(sub.status).toBe("canceled");
    expect(sub.autoRenew).toBe(false);
    expect(isSubscriptionActive(sub)).toBe(true);
    expect(deriveSubscriptionUiState(sub)).toBe("canceling");
  });

  it("reactivate restores autoRenew", () => {
    const canceled = cancelSubscription(startSubscription());
    const reactivated = reactivateSubscription(canceled);
    expect(reactivated.status).toBe("active");
    expect(reactivated.autoRenew).toBe(true);
    expect(deriveSubscriptionUiState(reactivated)).toBe("active");
  });

  it("renew increments renewals and extends period", () => {
    const sub = startSubscription();
    const renewed = renewSubscription(sub);
    expect(renewed.renewals).toBe(2);
    expect(new Date(renewed.currentPeriodEnd).getTime()).toBeGreaterThan(
      new Date(sub.currentPeriodEnd).getTime(),
    );
  });

  it("tick auto-renews expired subscriptions with autoRenew on", () => {
    const sub = startSubscription();
    const expired = { ...sub, currentPeriodEnd: new Date(Date.now() - 1000).toISOString() };
    const [next, changed] = tickSubscription(expired);
    expect(changed).toBe(true);
    expect(next).not.toBeNull();
    expect(next?.renewals).toBe(2);
    expect(isSubscriptionActive(next)).toBe(true);
  });

  it("tick discards expired subscriptions when autoRenew is off", () => {
    const canceled = cancelSubscription(startSubscription());
    const expired = { ...canceled, currentPeriodEnd: new Date(Date.now() - 1000).toISOString() };
    const [next, changed] = tickSubscription(expired);
    expect(changed).toBe(true);
    expect(next).toBeNull();
  });

  it("tick is a no-op when still in period", () => {
    const sub = startSubscription();
    const [next, changed] = tickSubscription(sub);
    expect(changed).toBe(false);
    expect(next).toBe(sub);
  });

  it("deriveSubscriptionUiState identifies lapsed when expired without renewal", () => {
    const canceled = cancelSubscription(startSubscription());
    const expired = { ...canceled, currentPeriodEnd: new Date(Date.now() - 1000).toISOString() };
    expect(deriveSubscriptionUiState(expired)).toBe("lapsed");
  });
});

describe("parseSubscription", () => {
  it("migrates legacy boolean true into an active subscription", () => {
    const sub = parseSubscription(true);
    expect(sub).not.toBeNull();
    expect(sub?.status).toBe("active");
    expect(sub?.renewals).toBe(1);
  });

  it("legacy false maps to null", () => {
    expect(parseSubscription(false)).toBeNull();
    expect(parseSubscription(null)).toBeNull();
  });

  it("invalid object shapes return null", () => {
    expect(parseSubscription({ foo: "bar" })).toBeNull();
    expect(parseSubscription({ status: "active", startedAt: "x" })).toBeNull();
  });

  it("round-trips a valid subscription", () => {
    const original = startSubscription();
    const parsed = parseSubscription(JSON.parse(JSON.stringify(original)));
    expect(parsed).toEqual(original);
  });
});
