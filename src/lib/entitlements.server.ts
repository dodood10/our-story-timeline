/**
 * Entitlements no servidor (service role + leitura autenticada).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import type { SurpriseTier } from "@/lib/access-purchase";
import {
  parseSubscription,
  renewSubscription,
  startSubscription,
  tickSubscription,
  type MemoryLaneSubscription,
  type StoredSubscription,
} from "@/lib/memory-lane-subscription";
import type { CheckoutProductKey } from "@/lib/checkout-products";
import { isPaidStatus } from "@/lib/mercadopago.server";

export type EntitlementsRow = {
  surpriseTier: SurpriseTier;
  subscription: StoredSubscription;
};

export type EntitlementsPayload = EntitlementsRow & {
  subscriptionState: ReturnType<
    typeof import("@/lib/memory-lane-subscription").deriveSubscriptionUiState
  >;
  productMode: ReturnType<typeof import("@/lib/access-purchase").deriveProductMode>;
  hasSurprise: boolean;
  canUseMemoryLane: boolean;
  canUseSurprise: boolean;
  hasAnyProduct: boolean;
};

const DEFAULT_ROW: EntitlementsRow = {
  surpriseTier: "none",
  subscription: null,
};

function rowFromDb(
  data: {
    surprise_tier: string;
    subscription: unknown;
  } | null,
): EntitlementsRow {
  if (!data) return { ...DEFAULT_ROW };
  const tier = data.surprise_tier;
  const surpriseTier: SurpriseTier = tier === "basic" || tier === "premium" ? tier : "none";
  return {
    surpriseTier,
    subscription: parseSubscription(data.subscription),
  };
}

export async function fetchEntitlementsForUser(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<EntitlementsRow> {
  const { data, error } = await client
    .from("user_entitlements")
    .select("surprise_tier, subscription")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[entitlements] fetch falhou", error);
    return { ...DEFAULT_ROW };
  }
  return rowFromDb(data);
}

export async function upsertEntitlementsAdmin(userId: string, row: EntitlementsRow): Promise<void> {
  const { error } = await supabaseAdmin.from("user_entitlements").upsert(
    {
      user_id: userId,
      surprise_tier: row.surpriseTier,
      subscription: row.subscription as never,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("[entitlements] upsert falhou", error);
    throw error;
  }
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();
  if (error || !data) return null;
  return data.id;
}

export function parseUserIdFromExternalReference(ref: string): string | null {
  const match = /^u:([0-9a-f-]{36})\|/i.exec(ref);
  return match?.[1] ?? null;
}

export function buildExternalReference(userId: string | null, suffix: string): string {
  if (userId) return `u:${userId}|${suffix}`;
  return suffix;
}

export function mergeSurpriseTier(current: SurpriseTier, next: SurpriseTier): SurpriseTier {
  if (next === "premium") return "premium";
  if (next === "basic" && current !== "premium") return "basic";
  return current;
}

function applyProductToRow(row: EntitlementsRow, productKey: CheckoutProductKey): EntitlementsRow {
  switch (productKey) {
    case "surprise:premium":
      return {
        ...row,
        surpriseTier: mergeSurpriseTier(row.surpriseTier, "premium"),
      };
    case "surprise:basic":
      return {
        ...row,
        surpriseTier: mergeSurpriseTier(row.surpriseTier, "basic"),
      };
    case "memory_lane": {
      const sub = row.subscription;
      const active = sub && new Date(sub.currentPeriodEnd).getTime() > Date.now();
      return {
        surpriseTier: row.surpriseTier,
        subscription: active && sub ? renewSubscription(sub) : startSubscription(),
      };
    }
    default:
      return row;
  }
}

/** Concede produto após pagamento aprovado. */
export async function grantEntitlementsFromPayment(input: {
  userId: string | null;
  payerEmail: string | null;
  productKey: string;
  externalReference: string;
}): Promise<void> {
  let userId = input.userId ?? parseUserIdFromExternalReference(input.externalReference);
  if (!userId && input.payerEmail) {
    userId = await findUserIdByEmail(input.payerEmail);
  }
  if (!userId) {
    console.warn("[entitlements] pagamento sem usuário vinculado", input.externalReference);
    return;
  }

  const productKey = input.productKey as CheckoutProductKey;
  if (
    productKey !== "surprise:premium" &&
    productKey !== "surprise:basic" &&
    productKey !== "memory_lane"
  ) {
    return;
  }

  const current = await fetchEntitlementsForUser(supabaseAdmin, userId);
  const next = applyProductToRow(current, productKey);
  await upsertEntitlementsAdmin(userId, next);
}

/** Vincula pagamentos pendentes ao e-mail do usuário após login/cadastro. */
export async function linkPendingPaymentsByEmail(userId: string, email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;

  const { data: payments, error } = await supabaseAdmin
    .from("payments")
    .select("id, external_reference, status, product_key, payer_email, user_id")
    .ilike("payer_email", normalized)
    .is("user_id", null);

  if (error || !payments?.length) return;

  for (const p of payments) {
    await supabaseAdmin.from("payments").update({ user_id: userId }).eq("id", p.id);
    if (isPaidStatus(p.status)) {
      await grantEntitlementsFromPayment({
        userId,
        payerEmail: p.payer_email,
        productKey: p.product_key,
        externalReference: p.external_reference,
      });
    }
  }
}

/**
 * Migra apenas a assinatura Memory Lane do dispositivo local para o servidor.
 * O tier de Surpresa nunca é aceito do cliente — só via webhook de pagamento.
 */
export async function migrateLocalSubscriptionAdmin(
  userId: string,
  subscription: MemoryLaneSubscription | null,
): Promise<EntitlementsRow> {
  const current = await fetchEntitlementsForUser(supabaseAdmin, userId);
  if (current.subscription !== null || subscription === null) return current;

  const row: EntitlementsRow = {
    surpriseTier: current.surpriseTier,
    subscription,
  };
  await upsertEntitlementsAdmin(userId, row);
  return row;
}

/** @deprecated Use migrateLocalSubscriptionAdmin — mantido para compatibilidade interna. */
export async function migrateLocalEntitlementsAdmin(
  userId: string,
  local: { surpriseTier: SurpriseTier; subscription: MemoryLaneSubscription | null },
): Promise<EntitlementsRow> {
  return migrateLocalSubscriptionAdmin(userId, local.subscription);
}

export function tickEntitlementsRow(row: EntitlementsRow): EntitlementsRow {
  const [subscription] = tickSubscription(row.subscription);
  return { ...row, subscription };
}
