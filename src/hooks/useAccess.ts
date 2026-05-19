import { useCallback, useEffect, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import {
  KEY_FULL,
  KEY_SURPRISE,
  applyPurchaseToStorage,
  deriveProductMode,
  hasActiveMemoryLane,
  type ApplyPurchaseOptions,
  type ProductMode,
  type StoredSubscription,
  type SurpriseTier,
} from "@/lib/access-purchase";
import {
  cancelSubscription,
  deriveSubscriptionUiState,
  parseSubscription,
  reactivateSubscription,
  renewSubscription,
  startSubscription,
  tickSubscription,
  type MemoryLaneSubscription,
  type SubscriptionUiState,
} from "@/lib/memory-lane-subscription";

export type {
  SurpriseTier,
  ProductMode,
  ApplyPurchaseOptions,
  MemoryLaneSubscription,
  SubscriptionUiState,
};

/** Mocked access control. Replace with real auth/checkout later. */
export function useAccess() {
  const [surprise, setSurprise, hSurprise] = useLocalStorage<SurpriseTier>(KEY_SURPRISE, "none");
  const [rawSub, setRawSub, hFull] = useLocalStorage<unknown>(KEY_FULL, null);
  const hydrated = hSurprise && hFull;

  const subscription = useMemo<StoredSubscription>(() => parseSubscription(rawSub), [rawSub]);

  // Tick na hidratação: simula o gateway renovando/expirando assinaturas.
  useEffect(() => {
    if (!hydrated) return;
    const [next, changed] = tickSubscription(subscription);
    if (changed) setRawSub(next);
  }, [hydrated, subscription, setRawSub]);

  const setSubscription = useCallback((sub: StoredSubscription) => setRawSub(sub), [setRawSub]);

  const hasSurprise = surprise === "basic" || surprise === "premium";
  const canUseMemoryLane = hasActiveMemoryLane(subscription);
  const productMode = deriveProductMode(surprise, subscription);
  const subscriptionState = deriveSubscriptionUiState(subscription);
  /**
   * Inclui `lapsed` (assinatura vencida) para que o usuário consiga acessar `/app`
   * e ver o banner de renovação, em vez de ser redirecionado para a landing.
   */
  const hasAnyProduct = hasSurprise || canUseMemoryLane || subscriptionState === "lapsed";
  const canUseSurprise = hasSurprise;

  const applyPurchase = useCallback(
    (opts: ApplyPurchaseOptions) => {
      if (opts.memoryLaneOnly) {
        setSurprise("none");
        setSubscription(startSubscription());
        return;
      }
      if (opts.surpriseTier) {
        setSurprise(opts.surpriseTier);
      }
    },
    [setSurprise, setSubscription],
  );

  const cancelMemoryLane = useCallback(() => {
    if (!subscription) return;
    setSubscription(cancelSubscription(subscription));
  }, [subscription, setSubscription]);

  const reactivateMemoryLane = useCallback(() => {
    if (!subscription) return;
    setSubscription(reactivateSubscription(subscription));
  }, [subscription, setSubscription]);

  const renewMemoryLaneNow = useCallback(() => {
    setSubscription(subscription ? renewSubscription(subscription) : startSubscription());
  }, [subscription, setSubscription]);

  const setProductMode = useCallback(
    (mode: ProductMode) => {
      switch (mode) {
        case "none":
          setSurprise("none");
          setSubscription(null);
          break;
        case "surprise_only":
          setSurprise("premium");
          setSubscription(null);
          break;
        case "memory_lane_only":
          setSurprise("none");
          setSubscription(startSubscription());
          break;
        case "both":
          setSurprise("premium");
          setSubscription(startSubscription());
          break;
      }
    },
    [setSurprise, setSubscription],
  );

  /** Dev helper: empurra a assinatura para vencida sem renovar. */
  const expireMemoryLaneNow = useCallback(() => {
    if (!subscription) return;
    const past = new Date(Date.now() - 60_000).toISOString();
    setSubscription({ ...subscription, currentPeriodEnd: past, autoRenew: false });
  }, [subscription, setSubscription]);

  return {
    surprise,
    setSurprise,
    subscription,
    setSubscription,
    hydrated,
    hasSurprise,
    isPremium: surprise === "premium",
    hasAnyProduct,
    canUseSurprise,
    canUseMemoryLane,
    productMode,
    subscriptionState,
    applyPurchase,
    cancelMemoryLane,
    reactivateMemoryLane,
    renewMemoryLaneNow,
    expireMemoryLaneNow,
    setProductMode,
    reset: () => {
      setSurprise("none");
      setSubscription(null);
    },
  };
}

export { applyPurchaseToStorage, deriveProductMode };
