/**
 * Memory Lane subscription (mensal mockado).
 *
 * Persistido em `localStorage` sob a chave `KEY_FULL` ("ml.access.full") para
 * manter a chave histórica. O formato antigo era `boolean` ("comprado vitalício").
 * O parser `parseSubscription` migra o valor legado para uma assinatura ativa
 * com período corrente de 30 dias.
 *
 * Em produção esse estado virá de webhooks do gateway. Aqui simulamos:
 *  - auto-renovação: ao abrir o app, se `autoRenew` e `currentPeriodEnd < now`,
 *    estende +30 dias e incrementa `renewals`.
 *  - cancelamento: zera `autoRenew` e marca `status="canceled"`, preservando
 *    o acesso até `currentPeriodEnd`.
 *  - expiração natural: quando `currentPeriodEnd < now` e `!autoRenew`,
 *    a assinatura é descartada (volta a `null` → exige nova compra).
 */

export const SUBSCRIPTION_PERIOD_DAYS = 30;
export const SUBSCRIPTION_PRICE_CENTS = 2990;

export type SubscriptionStatus = "active" | "canceled" | "past_due";

export interface MemoryLaneSubscription {
  status: SubscriptionStatus;
  /** ISO date — quando a assinatura começou (não muda em renovações). */
  startedAt: string;
  /** ISO date — fim do período corrente (também limite do acesso quando canceled). */
  currentPeriodEnd: string;
  /** Se `true`, a cada `tick` o período é estendido. Cancelar = `false`. */
  autoRenew: boolean;
  /** Quantos períodos foram pagos (inicia em 1 na compra). */
  renewals: number;
}

export type StoredSubscription = MemoryLaneSubscription | null;

function nowIso(): string {
  return new Date().toISOString();
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function isIsoInFuture(iso: string): boolean {
  return new Date(iso).getTime() > Date.now();
}

export function parseSubscription(raw: unknown): StoredSubscription {
  if (raw == null || raw === false) return null;
  if (raw === true) {
    const startedAt = nowIso();
    return {
      status: "active",
      startedAt,
      currentPeriodEnd: addDaysIso(startedAt, SUBSCRIPTION_PERIOD_DAYS),
      autoRenew: true,
      renewals: 1,
    };
  }
  if (typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (
    typeof obj.startedAt !== "string" ||
    typeof obj.currentPeriodEnd !== "string" ||
    typeof obj.autoRenew !== "boolean" ||
    typeof obj.renewals !== "number" ||
    (obj.status !== "active" && obj.status !== "canceled" && obj.status !== "past_due")
  ) {
    return null;
  }
  return {
    status: obj.status,
    startedAt: obj.startedAt,
    currentPeriodEnd: obj.currentPeriodEnd,
    autoRenew: obj.autoRenew,
    renewals: obj.renewals,
  };
}

export function isSubscriptionActive(sub: StoredSubscription): boolean {
  if (!sub) return false;
  return isIsoInFuture(sub.currentPeriodEnd);
}

/**
 * Estado da assinatura para UI:
 *  - `none`: nunca assinou ou perdeu acesso definitivamente.
 *  - `active`: tem acesso e autoRenew = true.
 *  - `canceling`: cancelou mas ainda tem acesso até o fim do período.
 *  - `lapsed`: foi assinante, perdeu acesso (assinatura antiga descartada).
 */
export type SubscriptionUiState = "none" | "active" | "canceling" | "lapsed";

export function deriveSubscriptionUiState(sub: StoredSubscription): SubscriptionUiState {
  if (!sub) return "none";
  if (!isIsoInFuture(sub.currentPeriodEnd)) return "lapsed";
  if (sub.status === "canceled" || !sub.autoRenew) return "canceling";
  return "active";
}

/** Cria uma nova assinatura (compra inicial). */
export function startSubscription(): MemoryLaneSubscription {
  const startedAt = nowIso();
  return {
    status: "active",
    startedAt,
    currentPeriodEnd: addDaysIso(startedAt, SUBSCRIPTION_PERIOD_DAYS),
    autoRenew: true,
    renewals: 1,
  };
}

/** Estende +30 dias e marca como ativa (uso pelo "webhook" mock ou renovação manual). */
export function renewSubscription(sub: MemoryLaneSubscription): MemoryLaneSubscription {
  const base = isIsoInFuture(sub.currentPeriodEnd) ? sub.currentPeriodEnd : nowIso();
  return {
    ...sub,
    status: "active",
    currentPeriodEnd: addDaysIso(base, SUBSCRIPTION_PERIOD_DAYS),
    autoRenew: true,
    renewals: sub.renewals + 1,
  };
}

export function cancelSubscription(sub: MemoryLaneSubscription): MemoryLaneSubscription {
  return { ...sub, status: "canceled", autoRenew: false };
}

export function reactivateSubscription(sub: MemoryLaneSubscription): MemoryLaneSubscription {
  return { ...sub, status: "active", autoRenew: true };
}

/**
 * Tick chamado na inicialização do app — simula o gateway:
 *  - se autoRenew e período passou → renova
 *  - se !autoRenew e período passou → descarta (vira null)
 *  - caso contrário, retorna o mesmo objeto
 *
 * Retorna `[novoEstado, mudou?]`.
 */
export function tickSubscription(sub: StoredSubscription): [StoredSubscription, boolean] {
  if (!sub) return [null, false];
  if (isIsoInFuture(sub.currentPeriodEnd)) return [sub, false];
  if (sub.autoRenew) return [renewSubscription(sub), true];
  return [null, true];
}

export function formatNextChargeDate(sub: MemoryLaneSubscription): string {
  return new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
