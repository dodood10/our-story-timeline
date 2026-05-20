/**
 * Admin backoffice — leitura/audit via service role.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  deriveSubscriptionUiState,
  isSubscriptionActive,
  parseSubscription,
} from "@/lib/memory-lane-subscription";
import { isPaidStatus } from "@/lib/mercadopago.server";
import type { SurpriseTier } from "@/lib/access-purchase";
import { fetchEntitlementsForUser, type EntitlementsRow } from "@/lib/entitlements.server";

export type AdminDashboardStats = {
  sales7dCents: number;
  sales7dCount: number;
  activeSurpriseCount: number;
  activeMemoryLaneCount: number;
  orphanPaymentsCount: number;
};

export type AdminUserSearchRow = {
  id: string;
  email: string | null;
  surpriseTier: SurpriseTier;
  subscriptionState: ReturnType<typeof deriveSubscriptionUiState>;
  updatedAt: string | null;
};

export type AdminUserDetail = {
  id: string;
  email: string | null;
  displayName: string | null;
  entitlements: EntitlementsRow;
  subscriptionState: ReturnType<typeof deriveSubscriptionUiState>;
  payments: AdminPaymentRow[];
};

export type AdminPaymentRow = {
  id: string;
  status: string;
  amountCents: number;
  productKey: string;
  payerEmail: string | null;
  userId: string | null;
  paymentMethod: string;
  externalReference: string;
  createdAt: string;
};

export async function logAdminAction(
  adminUserId: string,
  action: string,
  targetUserId: string | null,
  payload: Record<string, unknown> | null,
): Promise<void> {
  const { error } = await supabaseAdmin.from("admin_audit_log").insert({
    admin_user_id: adminUserId,
    action,
    target_user_id: targetUserId,
    payload: payload as never,
  });
  if (error) {
    console.warn("[admin] audit log falhou (migration aplicada?)", error.message);
  }
}

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 7);
  const sinceIso = since.toISOString();

  const { data: recentPayments, error: payErr } = await supabaseAdmin
    .from("payments")
    .select("amount_cents, status, user_id")
    .gte("created_at", sinceIso);

  if (payErr) throw payErr;

  let sales7dCents = 0;
  let sales7dCount = 0;
  for (const p of recentPayments ?? []) {
    if (isPaidStatus(p.status)) {
      sales7dCents += p.amount_cents;
      sales7dCount += 1;
    }
  }

  const { data: entitlements, error: entErr } = await supabaseAdmin
    .from("user_entitlements")
    .select("surprise_tier, subscription");

  if (entErr) throw entErr;

  let activeSurpriseCount = 0;
  let activeMemoryLaneCount = 0;
  for (const e of entitlements ?? []) {
    if (e.surprise_tier === "basic" || e.surprise_tier === "premium") {
      activeSurpriseCount += 1;
    }
    const sub = parseSubscription(e.subscription);
    if (sub && isSubscriptionActive(sub)) {
      activeMemoryLaneCount += 1;
    }
  }

  const { count: orphanPaymentsCount, error: orphanErr } = await supabaseAdmin
    .from("payments")
    .select("id", { count: "exact", head: true })
    .is("user_id", null)
    .in("status", ["approved"]);

  if (orphanErr) throw orphanErr;

  return {
    sales7dCents,
    sales7dCount,
    activeSurpriseCount,
    activeMemoryLaneCount,
    orphanPaymentsCount: orphanPaymentsCount ?? 0,
  };
}

export async function searchUsersByEmail(query: string, limit = 20): Promise<AdminUserSearchRow[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email")
    .ilike("email", `%${q}%`)
    .limit(limit);

  if (error) throw error;
  if (!profiles?.length) return [];

  const ids = profiles.map((p) => p.id);
  const { data: ents } = await supabaseAdmin
    .from("user_entitlements")
    .select("user_id, surprise_tier, subscription, updated_at")
    .in("user_id", ids);

  const entMap = new Map((ents ?? []).map((e) => [e.user_id, e]));

  return profiles.map((p) => {
    const ent = entMap.get(p.id);
    const tier =
      ent?.surprise_tier === "basic" || ent?.surprise_tier === "premium"
        ? ent.surprise_tier
        : "none";
    const sub = parseSubscription(ent?.subscription);
    return {
      id: p.id,
      email: p.email,
      surpriseTier: tier as SurpriseTier,
      subscriptionState: deriveSubscriptionUiState(sub),
      updatedAt: ent?.updated_at ?? null,
    };
  });
}

function mapPaymentRow(p: {
  id: string;
  status: string;
  amount_cents: number;
  product_key: string;
  payer_email: string | null;
  user_id: string | null;
  payment_method: string;
  external_reference: string;
  created_at: string;
}): AdminPaymentRow {
  return {
    id: p.id,
    status: p.status,
    amountCents: p.amount_cents,
    productKey: p.product_key,
    payerEmail: p.payer_email,
    userId: p.user_id,
    paymentMethod: p.payment_method,
    externalReference: p.external_reference,
    createdAt: p.created_at,
  };
}

export async function getUserAdminDetail(userId: string): Promise<AdminUserDetail | null> {
  const { data: profile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("id, email, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (profErr) throw profErr;
  if (!profile) return null;

  const entitlements = await fetchEntitlementsForUser(supabaseAdmin, userId);
  const subscriptionState = deriveSubscriptionUiState(entitlements.subscription);

  let payQuery = supabaseAdmin
    .from("payments")
    .select(
      "id, status, amount_cents, product_key, payer_email, user_id, payment_method, external_reference, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (profile.email) {
    payQuery = payQuery.or(`user_id.eq.${userId},payer_email.ilike.${profile.email}`);
  } else {
    payQuery = payQuery.eq("user_id", userId);
  }

  const { data: payments, error: payErr } = await payQuery;

  if (payErr) throw payErr;

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    entitlements,
    subscriptionState,
    payments: (payments ?? []).map(mapPaymentRow),
  };
}

export async function listPaymentsAdmin(input: {
  status?: string;
  email?: string;
  orphanOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ rows: AdminPaymentRow[]; total: number }> {
  const limit = input.limit ?? 50;
  const offset = input.offset ?? 0;

  let query = supabaseAdmin
    .from("payments")
    .select(
      "id, status, amount_cents, product_key, payer_email, user_id, payment_method, external_reference, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (input.status) {
    query = query.eq("status", input.status);
  }
  if (input.email?.trim()) {
    query = query.ilike("payer_email", `%${input.email.trim()}%`);
  }
  if (input.orphanOnly) {
    query = query.is("user_id", null);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    rows: (data ?? []).map(mapPaymentRow),
    total: count ?? 0,
  };
}
