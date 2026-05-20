import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createConversionFromPayment } from "@/lib/affiliate.server";
import { grantEntitlementsFromPayment } from "@/lib/entitlements.server";
import { getMpPayment, isPaidStatus } from "@/lib/mercadopago.server";
import {
  findPaymentById,
  markCapiPurchaseSent,
  updatePaymentStatus,
} from "@/lib/payments.server";
import { sendMetaPurchase } from "@/lib/meta-capi.server";

/**
 * Webhook do Mercado Pago — eventos "payment".
 *
 * Verificação de assinatura conforme docs:
 *   https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks#editor_5
 * Header `x-signature` no formato `ts=<unix>,v1=<hex>`.
 * Manifest assinado: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 */
function verifyMpSignature(
  secret: string,
  signatureHeader: string | null,
  requestId: string | null,
  dataId: string | null,
): boolean {
  if (!signatureHeader || !dataId) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const [k, ...v] = kv.split("=");
      return [k.trim(), v.join("=").trim()];
    }),
  ) as { ts?: string; v1?: string };
  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId};request-id:${requestId ?? ""};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  try {
    const a = Buffer.from(parts.v1, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/mercadopago-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const queryId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
        let body: { type?: string; action?: string; data?: { id?: string } } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          /* notificação pode vir só pela query */
        }
        const id = body.data?.id ?? queryId;
        const type = body.type ?? body.action ?? url.searchParams.get("type") ?? "";

        if (!id || !type.includes("payment")) {
          return new Response("ignored", { status: 200 });
        }

        // Verificação de assinatura (obrigatória se o secret estiver configurado).
        const secret = process.env.MP_WEBHOOK_SECRET;
        const isProd = process.env.NODE_ENV === "production";
        if (!secret) {
          if (isProd) {
            console.error("[mp-webhook] MP_WEBHOOK_SECRET obrigatório em produção");
            return new Response("webhook not configured", { status: 503 });
          }
          console.warn("[mp-webhook] MP_WEBHOOK_SECRET ausente — pulando verificação (dev)");
        } else {
          const ok = verifyMpSignature(
            secret,
            request.headers.get("x-signature"),
            request.headers.get("x-request-id"),
            id,
          );
          if (!ok) {
            console.warn("[mp-webhook] assinatura inválida", { id });
            return new Response("invalid signature", { status: 401 });
          }
        }

        try {
          const p = await getMpPayment(id);
          console.log("[mp-webhook]", { id: p.id, status: p.status, statusDetail: p.statusDetail });
          await updatePaymentStatus({ id: p.id, status: p.status, raw: p });
          if (isPaidStatus(p.status)) {
            const row = await findPaymentById(p.id);
            if (row) {
              await grantEntitlementsFromPayment({
                userId: row.user_id,
                payerEmail: row.payer_email,
                productKey: row.product_key,
                externalReference: row.external_reference,
              });
              await createConversionFromPayment(row);
              // Meta CAPI — envio idempotente do Purchase (dedup pelo event_id).
              if (await markCapiPurchaseSent(row.id)) {
                await sendMetaPurchase({
                  eventId: row.id,
                  amountCents: row.amount_cents,
                  contentId: row.product_key,
                  user: {
                    email: row.payer_email,
                    fbp: row.fbp,
                    fbc: row.fbc,
                    clientIp: row.client_ip,
                    userAgent: row.client_ua,
                  },
                });
              }
            }
          }
        } catch (e) {
          console.error("[mp-webhook] lookup falhou", e);
        }
        return new Response("ok", { status: 200 });
      },
      GET: async () => new Response("ok", { status: 200 }),
    },
  },
});
