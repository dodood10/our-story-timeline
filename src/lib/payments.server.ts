/**
 * Persistência de pagamentos (Mercado Pago) na tabela public.payments.
 * Usado apenas em código server-side (server fns / webhook).
 *
 * RLS bloqueia anon/authenticated — escrevemos com service role.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { parseAffiliateCodeFromExternalReference } from "@/lib/affiliate-reference";
import type { CheckoutProductKey } from "@/lib/checkout-products";

type PaymentMethod = "pix" | "card";

export interface PaymentRow {
  id: string;
  external_reference: string;
  status: string;
  amount_cents: number;
  product_key: string;
  payer_email: string | null;
  payment_method: string;
  user_id: string | null;
  affiliate_code: string | null;
  updated_at: string;
}

export async function recordPaymentCreated(input: {
  id: string;
  externalReference: string;
  status: string;
  amountCents: number;
  productKey: CheckoutProductKey;
  payerEmail?: string | null;
  paymentMethod: PaymentMethod;
  userId?: string | null;
  affiliateCode?: string | null;
}): Promise<void> {
  const affiliate_code =
    input.affiliateCode ?? parseAffiliateCodeFromExternalReference(input.externalReference);
  const { error } = await supabaseAdmin.from("payments").upsert(
    {
      id: input.id,
      external_reference: input.externalReference,
      status: input.status,
      amount_cents: input.amountCents,
      product_key: input.productKey,
      payer_email: input.payerEmail ?? null,
      payment_method: input.paymentMethod,
      user_id: input.userId ?? null,
      affiliate_code,
    },
    { onConflict: "id" },
  );
  if (error) {
    console.error("[payments] recordPaymentCreated falhou", error);
  }
}

export async function updatePaymentStatus(input: {
  id: string;
  status: string;
  raw?: unknown;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from("payments")
    .update({
      status: input.status,
      raw: (input.raw as never) ?? null,
    })
    .eq("id", input.id);
  if (error) {
    console.error("[payments] updatePaymentStatus falhou", error);
  }
}

export async function findPaymentById(id: string): Promise<PaymentRow | null> {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select(
      "id, external_reference, status, amount_cents, product_key, payer_email, payment_method, user_id, affiliate_code, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[payments] findPaymentById falhou", error);
    return null;
  }
  return (data as PaymentRow | null) ?? null;
}

export async function findPaymentByExternalReference(
  externalReference: string,
): Promise<PaymentRow | null> {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select(
      "id, external_reference, status, amount_cents, product_key, payer_email, payment_method, user_id, updated_at",
    )
    .eq("external_reference", externalReference)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[payments] findPaymentByExternalReference falhou", error);
    return null;
  }
  return (data as PaymentRow | null) ?? null;
}
