import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./useLocalStorage";
import { useAuth } from "./useAuth";
import {
  KEY_FULL,
  KEY_SURPRISE,
  applyPurchaseToStorage,
  deriveProductMode,
  hasActiveMemoryLane,
  readStoredSubscription,
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
import {
  getEntitlements,
  migrateLocalEntitlements,
  syncEntitlementsAfterAuth,
  type EntitlementsPayload,
} from "@/lib/entitlements.functions";

export type {
  SurpriseTier,
  ProductMode,
  ApplyPurchaseOptions,
  MemoryLaneSubscription,
  SubscriptionUiState,
};

const ENTITLEMENTS_QUERY_KEY = ["entitlements"] as const;

function emptyEntitlements(): EntitlementsPayload {
  return {
    surpriseTier: "none",
    subscription: null,
    subscriptionState: "none",
    productMode: "none",
    hasSurprise: false,
    canUseMemoryLane: false,
    canUseSurprise: false,
    hasAnyProduct: false,
  };
}

/** Acesso ao produto: servidor quando autenticado; localStorage só em DEV sem Supabase. */
export function useAccess() {
  const { isAuthenticated, user, configured, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [surpriseLocal, setSurpriseLocal, hSurprise] = useLocalStorage<SurpriseTier>(
    KEY_SURPRISE,
    "none",
  );
  const [rawSubLocal, setRawSubLocal, hFull] = useLocalStorage<unknown>(KEY_FULL, null);
  const localHydrated = hSurprise && hFull;

  const useServer = configured && isAuthenticated;

  const entitlementsQuery = useQuery({
    queryKey: ENTITLEMENTS_QUERY_KEY,
    queryFn: () => getEntitlements(),
    enabled: useServer && !authLoading,
    staleTime: 30_000,
  });

  const serverPayload = entitlementsQuery.data;
  const serverLoading = useServer && (authLoading || entitlementsQuery.isLoading);

  const subscriptionLocal = useMemo<StoredSubscription>(
    () => parseSubscription(rawSubLocal),
    [rawSubLocal],
  );

  useEffect(() => {
    if (!localHydrated || useServer) return;
    const [next, changed] = tickSubscription(subscriptionLocal);
    if (changed) setRawSubLocal(next);
  }, [localHydrated, useServer, subscriptionLocal, setRawSubLocal]);

  const surprise = useServer ? (serverPayload?.surpriseTier ?? "none") : surpriseLocal;
  const subscription = useServer ? (serverPayload?.subscription ?? null) : subscriptionLocal;

  const hydrated = useServer ? !serverLoading && !authLoading : localHydrated;

  const hasSurprise = useServer
    ? (serverPayload?.hasSurprise ?? false)
    : surprise === "basic" || surprise === "premium";
  const canUseMemoryLane = useServer
    ? (serverPayload?.canUseMemoryLane ?? false)
    : hasActiveMemoryLane(subscription);
  const productMode = useServer
    ? (serverPayload?.productMode ?? "none")
    : deriveProductMode(surpriseLocal, subscriptionLocal);
  const subscriptionState = useServer
    ? (serverPayload?.subscriptionState ?? "none")
    : deriveSubscriptionUiState(subscription);
  const hasAnyProduct = useServer
    ? (serverPayload?.hasAnyProduct ?? false)
    : hasSurprise || canUseMemoryLane || subscriptionState === "lapsed";
  const canUseSurprise = useServer ? (serverPayload?.canUseSurprise ?? false) : hasSurprise;

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ENTITLEMENTS_QUERY_KEY });
  }, [queryClient]);

  const applyPurchase = useCallback(
    async (opts: ApplyPurchaseOptions) => {
      if (useServer && user) {
        // Entitlements são concedidos pelo servidor via webhook ou getMpPaymentStatus.
        // Aqui apenas invalidamos o cache para a UI refletir o novo estado.
        invalidate();
        return;
      }
      applyPurchaseToStorage(opts);
      if (opts.memoryLaneOnly) {
        setSurpriseLocal("none");
        setRawSubLocal(startSubscription());
      } else if (opts.surpriseTier) {
        setSurpriseLocal(opts.surpriseTier);
      }
    },
    [useServer, user, invalidate, setSurpriseLocal, setRawSubLocal],
  );

  const patchSubscription = useCallback(
    async (next: StoredSubscription) => {
      if (useServer) {
        await migrateLocalEntitlements({ data: { subscription: next } });
        invalidate();
        return;
      }
      setRawSubLocal(next);
    },
    [useServer, invalidate, setRawSubLocal],
  );

  const cancelMemoryLane = useCallback(() => {
    if (!subscription) return;
    void patchSubscription(cancelSubscription(subscription));
  }, [subscription, patchSubscription]);

  const reactivateMemoryLane = useCallback(() => {
    if (!subscription) return;
    void patchSubscription(reactivateSubscription(subscription));
  }, [subscription, patchSubscription]);

  const renewMemoryLaneNow = useCallback(() => {
    void patchSubscription(subscription ? renewSubscription(subscription) : startSubscription());
  }, [subscription, patchSubscription]);

  const expireMemoryLaneNow = useCallback(() => {
    if (!subscription) return;
    const past = new Date(Date.now() - 60_000).toISOString();
    void patchSubscription({ ...subscription, currentPeriodEnd: past, autoRenew: false });
  }, [subscription, patchSubscription]);

  const setProductMode = useCallback(
    (mode: ProductMode) => {
      // Operação exclusiva de desenvolvimento — em produção só afeta localStorage.
      const run = async () => {
        switch (mode) {
          case "none":
            setSurpriseLocal("none");
            setRawSubLocal(null);
            break;
          case "surprise_only":
            setSurpriseLocal("premium");
            setRawSubLocal(null);
            break;
          case "memory_lane_only":
            setSurpriseLocal("none");
            setRawSubLocal(startSubscription());
            break;
          case "both":
            setSurpriseLocal("premium");
            setRawSubLocal(startSubscription());
            break;
        }
        if (useServer) invalidate();
      };
      void run();
    },
    [useServer, invalidate, setSurpriseLocal, setRawSubLocal],
  );

  const refreshFromServer = useCallback(async () => {
    if (!user?.email) return;
    await syncEntitlementsAfterAuth({ data: { email: user.email } });
    invalidate();
  }, [user?.email, invalidate]);

  return {
    surprise,
    setSurprise: setSurpriseLocal,
    subscription,
    setSubscription: (sub: StoredSubscription) => void patchSubscription(sub),
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
    refreshFromServer,
    invalidateEntitlements: invalidate,
    useServerEntitlements: useServer,
    entitlementsError: entitlementsQuery.error,
    reset: () => {
      setSurpriseLocal("none");
      setRawSubLocal(null);
      if (useServer) invalidate();
    },
  };
}

export { applyPurchaseToStorage, deriveProductMode, readStoredSubscription, emptyEntitlements };
