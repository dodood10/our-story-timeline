/**
 * Meta Conversions API (CAPI) — envio server-side de eventos.
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 * Dedup com o Pixel do navegador: usar o MESMO `event_id` (aqui = ID do pagamento).
 *
 * Lê secrets dentro dos handlers (NUNCA em escopo de módulo) — Worker SSR.
 */
import { createHash } from "node:crypto";
import { PIXEL_ID } from "@/lib/meta-pixel";

const GRAPH_VERSION = "v21.0";

function sha256Lower(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  if (!v) return undefined;
  return createHash("sha256").update(v).digest("hex");
}

function digitsOnly(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = value.replace(/\D+/g, "");
  return d || undefined;
}

export interface MetaPurchaseInput {
  /** ID do pagamento — usado como event_id para dedup com o Pixel. */
  eventId: string;
  /** Valor em centavos. */
  amountCents: number;
  currency?: string;
  /** Tempo do evento (unix seconds). Default: agora. */
  eventTime?: number;
  /** URL onde o evento aconteceu (recomendado). */
  eventSourceUrl?: string;
  /** SKU/identificador do produto. */
  contentId?: string;
  /** Dados do comprador para matching (serão hasheados). */
  user: {
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    cpf?: string | null;
    fbp?: string | null; // cookie _fbp
    fbc?: string | null; // cookie _fbc (ou derivado de fbclid)
    clientIp?: string | null;
    userAgent?: string | null;
  };
}

export interface MetaCapiResult {
  ok: boolean;
  status: number;
  body?: unknown;
  skipped?: "no_token" | "no_pixel";
}

/**
 * Envia evento Purchase à Conversions API.
 * Não lança: registra erro e retorna `ok=false` para não bloquear o webhook.
 */
export async function sendMetaPurchase(input: MetaPurchaseInput): Promise<MetaCapiResult> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("[meta-capi] META_CAPI_ACCESS_TOKEN ausente — pulando envio");
    return { ok: false, status: 0, skipped: "no_token" };
  }
  if (!PIXEL_ID) {
    return { ok: false, status: 0, skipped: "no_pixel" };
  }

  const testCode = process.env.META_CAPI_TEST_EVENT_CODE || undefined;

  const userData: Record<string, unknown> = {
    em: input.user.email ? [sha256Lower(input.user.email)] : undefined,
    ph: input.user.phone ? [sha256Lower(digitsOnly(input.user.phone))] : undefined,
    fn: input.user.firstName ? [sha256Lower(input.user.firstName)] : undefined,
    ln: input.user.lastName ? [sha256Lower(input.user.lastName)] : undefined,
    external_id: input.user.cpf ? [sha256Lower(digitsOnly(input.user.cpf))] : undefined,
    country: [sha256Lower("br")],
    fbp: input.user.fbp || undefined,
    fbc: input.user.fbc || undefined,
    client_ip_address: input.user.clientIp || undefined,
    client_user_agent: input.user.userAgent || undefined,
  };
  // Limpa undefineds
  for (const k of Object.keys(userData)) {
    if (userData[k] === undefined) delete userData[k];
  }

  const event = {
    event_name: "Purchase",
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: "website",
    event_source_url: input.eventSourceUrl,
    user_data: userData,
    custom_data: {
      currency: input.currency ?? "BRL",
      value: Number((input.amountCents / 100).toFixed(2)),
      content_ids: input.contentId ? [input.contentId] : undefined,
      content_type: "product",
      order_id: input.eventId,
    },
  };

  const body = {
    data: [event],
    ...(testCode ? { test_event_code: testCode } : {}),
  };

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as unknown;
    if (!res.ok) {
      console.error("[meta-capi] envio falhou", { status: res.status, json });
      return { ok: false, status: res.status, body: json };
    }
    console.log("[meta-capi] Purchase enviado", { event_id: input.eventId, status: res.status });
    return { ok: true, status: res.status, body: json };
  } catch (e) {
    console.error("[meta-capi] erro de rede", e);
    return { ok: false, status: 0 };
  }
}
