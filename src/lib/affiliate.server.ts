/**
 * Affiliate program — service role only.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

type AffiliateUpdate = Database["public"]["Tables"]["affiliates"]["Update"];
import {
  calculateCommissionCents,
  isSelfReferral,
  normalizeAffiliateCode,
  parseAffiliateCodeFromExternalReference,
} from "@/lib/affiliate-reference";
import { isPaidStatus } from "@/lib/mercadopago.server";
import type { PaymentRow } from "@/lib/payments.server";

export const COMMISSION_HOLD_DAYS = 7;

export type AffiliateStatus = "pending" | "active" | "paused";
export type ConversionStatus = "pending" | "approved" | "paid" | "reversed";

export type AffiliateRow = {
  id: string;
  code: string;
  user_id: string | null;
  name: string;
  email: string;
  commission_rate: number;
  status: AffiliateStatus;
  pix_key: string | null;
};

function mapAffiliate(row: {
  id: string;
  code: string;
  user_id: string | null;
  name: string;
  email: string;
  commission_rate: number;
  status: string;
  pix_key: string | null;
}): AffiliateRow {
  return {
    ...row,
    code: normalizeAffiliateCode(row.code),
    commission_rate: Number(row.commission_rate),
    status: row.status as AffiliateStatus,
  };
}

export async function findAffiliateByCode(code: string): Promise<AffiliateRow | null> {
  const normalized = normalizeAffiliateCode(code);
  const { data, error } = await supabaseAdmin
    .from("affiliates")
    .select("id, code, user_id, name, email, commission_rate, status, pix_key")
    .eq("code", normalized)
    .maybeSingle();
  if (error || !data) return null;
  return mapAffiliate(data);
}

export async function findAffiliateByUserId(userId: string): Promise<AffiliateRow | null> {
  const { data, error } = await supabaseAdmin
    .from("affiliates")
    .select("id, code, user_id, name, email, commission_rate, status, pix_key")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error || !data) return null;
  return mapAffiliate(data);
}

export async function recordAffiliateClick(
  affiliateId: string,
  meta: { path?: string; utmSource?: string },
): Promise<void> {
  const { error } = await supabaseAdmin.from("affiliate_clicks").insert({
    affiliate_id: affiliateId,
    path: meta.path ?? null,
    utm_source: meta.utmSource ?? null,
  });
  if (error) console.warn("[affiliate] click falhou", error.message);
}

export async function createConversionFromPayment(row: PaymentRow): Promise<void> {
  if (!isPaidStatus(row.status)) return;

  const code =
    row.affiliate_code ?? parseAffiliateCodeFromExternalReference(row.external_reference);
  if (!code) return;

  const affiliate = await findAffiliateByCode(code);
  if (!affiliate || affiliate.status !== "active") return;

  if (isSelfReferral(affiliate.email, row.payer_email)) {
    console.warn("[affiliate] auto-referral ignorado", row.id);
    return;
  }

  const commissionCents = calculateCommissionCents(row.amount_cents, affiliate.commission_rate);

  const { error } = await supabaseAdmin.from("affiliate_conversions").upsert(
    {
      affiliate_id: affiliate.id,
      payment_id: row.id,
      amount_cents: row.amount_cents,
      commission_cents: commissionCents,
      product_key: row.product_key,
      status: "pending",
    },
    { onConflict: "payment_id", ignoreDuplicates: true },
  );
  if (error && error.code !== "23505") {
    console.error("[affiliate] conversion falhou", error);
  }
}

export async function reverseConversionForPayment(paymentId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("affiliate_conversions")
    .update({ status: "reversed" })
    .eq("payment_id", paymentId)
    .in("status", ["pending", "approved"]);
  if (error) console.error("[affiliate] reverse falhou", error);
}

export async function approvePendingConversionsOlderThan(days: number): Promise<number> {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const { data, error } = await supabaseAdmin
    .from("affiliate_conversions")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("status", "pending")
    .lte("created_at", cutoff.toISOString())
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export type AffiliatePortalStats = {
  clicks7d: number;
  sales7d: number;
  commissionPendingCents: number;
  commissionApprovedCents: number;
  commissionPaidCents: number;
};

export async function getAffiliatePortalStats(affiliateId: string): Promise<AffiliatePortalStats> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 7);
  const sinceIso = since.toISOString();

  const { count: clicks7d } = await supabaseAdmin
    .from("affiliate_clicks")
    .select("id", { count: "exact", head: true })
    .eq("affiliate_id", affiliateId)
    .gte("clicked_at", sinceIso);

  const { data: conversions } = await supabaseAdmin
    .from("affiliate_conversions")
    .select("commission_cents, status, created_at")
    .eq("affiliate_id", affiliateId);

  let sales7d = 0;
  let commissionPendingCents = 0;
  let commissionApprovedCents = 0;
  let commissionPaidCents = 0;

  for (const c of conversions ?? []) {
    if (c.created_at >= sinceIso && c.status !== "reversed") sales7d += 1;
    if (c.status === "pending") commissionPendingCents += c.commission_cents;
    if (c.status === "approved") commissionApprovedCents += c.commission_cents;
    if (c.status === "paid") commissionPaidCents += c.commission_cents;
  }

  return {
    clicks7d: clicks7d ?? 0,
    sales7d,
    commissionPendingCents,
    commissionApprovedCents,
    commissionPaidCents,
  };
}

export type AffiliateConversionRow = {
  id: string;
  paymentId: string;
  amountCents: number;
  commissionCents: number;
  productKey: string;
  status: ConversionStatus;
  createdAt: string;
};

export async function listConversionsForAffiliate(
  affiliateId: string,
  limit = 50,
): Promise<AffiliateConversionRow[]> {
  const { data, error } = await supabaseAdmin
    .from("affiliate_conversions")
    .select("id, payment_id, amount_cents, commission_cents, product_key, status, created_at")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: c.id,
    paymentId: c.payment_id,
    amountCents: c.amount_cents,
    commissionCents: c.commission_cents,
    productKey: c.product_key,
    status: c.status as ConversionStatus,
    createdAt: c.created_at,
  }));
}

export async function updateAffiliatePixKey(affiliateId: string, pixKey: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("affiliates")
    .update({ pix_key: pixKey.trim() })
    .eq("id", affiliateId);
  if (error) throw error;
}

// --- Admin ---

export async function adminListAffiliates(): Promise<AffiliateRow[]> {
  const { data, error } = await supabaseAdmin
    .from("affiliates")
    .select("id, code, user_id, name, email, commission_rate, status, pix_key")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAffiliate);
}

export async function adminCreateAffiliate(input: {
  code: string;
  name: string;
  email: string;
  commissionRate: number;
  status?: AffiliateStatus;
}): Promise<AffiliateRow> {
  const { data, error } = await supabaseAdmin
    .from("affiliates")
    .insert({
      code: normalizeAffiliateCode(input.code),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      commission_rate: input.commissionRate,
      status: input.status ?? "pending",
    })
    .select("id, code, user_id, name, email, commission_rate, status, pix_key")
    .single();
  if (error) throw error;
  return mapAffiliate(data);
}

export async function adminUpdateAffiliate(
  id: string,
  patch: Partial<{
    name: string;
    commissionRate: number;
    status: AffiliateStatus;
    userId: string | null;
  }>,
): Promise<void> {
  const row: AffiliateUpdate = {};
  if (patch.name != null) row.name = patch.name.trim();
  if (patch.commissionRate != null) row.commission_rate = patch.commissionRate;
  if (patch.status != null) row.status = patch.status;
  if (patch.userId !== undefined) row.user_id = patch.userId;
  const { error } = await supabaseAdmin.from("affiliates").update(row).eq("id", id);
  if (error) throw error;
}

export async function linkAffiliateByEmail(affiliateId: string): Promise<boolean> {
  const { data: aff } = await supabaseAdmin
    .from("affiliates")
    .select("email")
    .eq("id", affiliateId)
    .maybeSingle();
  if (!aff?.email) return false;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("email", aff.email.trim())
    .maybeSingle();
  if (!profile) return false;

  await adminUpdateAffiliate(affiliateId, { userId: profile.id, status: "active" });
  return true;
}

export async function adminListConversions(filters?: {
  affiliateId?: string;
  status?: ConversionStatus;
  limit?: number;
}): Promise<(AffiliateConversionRow & { affiliateCode: string; affiliateEmail: string })[]> {
  let query = supabaseAdmin
    .from("affiliate_conversions")
    .select(
      "id, affiliate_id, payment_id, amount_cents, commission_cents, product_key, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(filters?.limit ?? 100);

  if (filters?.affiliateId) query = query.eq("affiliate_id", filters.affiliateId);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return [];

  const affiliateIds = [...new Set(data.map((c) => c.affiliate_id))];
  const { data: affiliates } = await supabaseAdmin
    .from("affiliates")
    .select("id, code, email")
    .in("id", affiliateIds);
  const affMap = new Map((affiliates ?? []).map((a) => [a.id, a]));

  return data.map((c) => {
    const aff = affMap.get(c.affiliate_id);
    return {
      id: c.id,
      paymentId: c.payment_id,
      amountCents: c.amount_cents,
      commissionCents: c.commission_cents,
      productKey: c.product_key,
      status: c.status as ConversionStatus,
      createdAt: c.created_at,
      affiliateCode: aff ? normalizeAffiliateCode(aff.code) : "—",
      affiliateEmail: aff?.email ?? "—",
    };
  });
}

export async function markConversionsPaid(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  const { data, error } = await supabaseAdmin
    .from("affiliate_conversions")
    .update({ status: "paid" })
    .in("id", ids)
    .eq("status", "approved")
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}
