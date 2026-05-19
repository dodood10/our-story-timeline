import {
  isSubscriptionActive,
  parseSubscription,
  startSubscription,
  type MemoryLaneSubscription,
  type StoredSubscription,
} from "./memory-lane-subscription";

export type SurpriseTier = "none" | "basic" | "premium";

export const KEY_SURPRISE = "ml.access.surprise";
/** Histórico: campo era boolean (lifetime). Agora guarda `MemoryLaneSubscription | null`. */
export const KEY_FULL = "ml.access.full";

export type ProductMode = "none" | "surprise_only" | "memory_lane_only" | "both";

export function hasActiveMemoryLane(sub: StoredSubscription): boolean {
  return isSubscriptionActive(sub);
}

export function deriveProductMode(
  surprise: SurpriseTier,
  memoryLane: StoredSubscription | boolean,
): ProductMode {
  const hasSurprise = surprise === "basic" || surprise === "premium";
  const hasMemoryLane =
    typeof memoryLane === "boolean" ? memoryLane : isSubscriptionActive(memoryLane);
  if (hasSurprise && hasMemoryLane) return "both";
  if (hasSurprise) return "surprise_only";
  if (hasMemoryLane) return "memory_lane_only";
  return "none";
}

export interface ApplyPurchaseOptions {
  /** Checkout surpresa: basic ou premium */
  surpriseTier?: Exclude<SurpriseTier, "none">;
  /** Checkout avulso Memory Lane — bloqueia surpresa e cria nova assinatura mensal */
  memoryLaneOnly?: boolean;
}

/** Persiste estado de acesso (mock checkout). Usado em testes e após pagamento. */
export function writeAccessState(surprise: SurpriseTier, sub: StoredSubscription): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_SURPRISE, JSON.stringify(surprise));
  window.localStorage.setItem(KEY_FULL, JSON.stringify(sub));
}

export function readStoredSubscription(): StoredSubscription {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY_FULL);
    if (raw == null) return null;
    return parseSubscription(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function applyPurchaseToStorage(opts: ApplyPurchaseOptions): void {
  if (opts.memoryLaneOnly) {
    writeAccessState("none", startSubscription());
    return;
  }
  if (opts.surpriseTier) {
    writeAccessState(opts.surpriseTier, readStoredSubscription());
  }
}

export type { MemoryLaneSubscription, StoredSubscription };
