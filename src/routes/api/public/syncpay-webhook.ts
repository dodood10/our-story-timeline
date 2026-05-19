import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Webhook do SyncPay (cashin).
 *
 * Como o app não tem banco de transações, este endpoint apenas valida o token
 * compartilhado e loga o evento — a liberação de acesso é feita no frontend
 * via polling (`getPixStatus`). Mantido aqui para registro/auditoria e para
 * permitir cadastro do webhook no painel SyncPay.
 *
 * O token compartilhado é enviado pelo SyncPay no cabeçalho `Authorization`
 * (ou query `?token=`) — configure ao criar o webhook em
 * POST /api/partner/v1/webhooks usando o valor de SYNCPAY_WEBHOOK_SECRET.
 */

const PayloadSchema = z.object({
  data: z
    .object({
      id: z.string().optional(),
      status: z.string().optional(),
      amount: z.number().optional(),
      externalreference: z.string().optional(),
    })
    .passthrough(),
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function unauthorized() {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export const Route = createFileRoute("/api/public/syncpay-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const expected = process.env.SYNCPAY_WEBHOOK_SECRET;
        if (!expected) return unauthorized();

        const url = new URL(request.url);
        const provided =
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          request.headers.get("x-webhook-token") ??
          url.searchParams.get("token") ??
          "";

        if (provided !== expected) return unauthorized();

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "invalid json" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }

        const parsed = PayloadSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ ok: true, ignored: true }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }

        console.info("[syncpay-webhook]", {
          id: parsed.data.data.id,
          status: parsed.data.data.status,
          amount: parsed.data.data.amount,
          ref: parsed.data.data.externalreference,
        });

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...CORS },
        });
      },
    },
  },
});
