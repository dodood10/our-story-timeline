import { createFileRoute } from "@tanstack/react-router";
import { getMpPayment } from "@/lib/mercadopago.server";

/**
 * Webhook do Mercado Pago.
 * Configure em Suas integrações → Webhooks → eventos "payment".
 * Validamos buscando o pagamento na API (não há HMAC nativo).
 */
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
          // notificação pode vir só pela query
        }
        const id = body.data?.id ?? queryId;
        const type = body.type ?? body.action ?? url.searchParams.get("type") ?? "";

        if (!id || !type.includes("payment")) {
          return new Response("ignored", { status: 200 });
        }

        try {
          const p = await getMpPayment(id);
          console.log("[mp-webhook]", { id: p.id, status: p.status, statusDetail: p.statusDetail });
        } catch (e) {
          console.error("[mp-webhook] lookup falhou", e);
        }
        return new Response("ok", { status: 200 });
      },
      GET: async () => new Response("ok", { status: 200 }),
    },
  },
});
