/**
 * SyncPay server-only helpers.
 *
 * Doc base: https://docs.syncpayments.com.br
 * - POST /api/partner/v1/auth-token   → Bearer token (1h)
 * - POST /api/partner/v1/cash-in      → cria cobrança Pix
 * - GET  /api/partner/v1/cash-in/{id} → consulta status
 * - POST /api/partner/v1/webhooks     → registra webhook
 *
 * Reads env INSIDE the handler — never at module scope.
 */

const SYNCPAY_BASE = "https://api.syncpayments.com.br";

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

// Cache de token por instância de worker (best-effort, vive ~1h).
let tokenCache: TokenCache | null = null;

async function fetchAuthToken(): Promise<string> {
  const clientId = process.env.SYNCPAY_CLIENT_ID;
  const clientSecret = process.env.SYNCPAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("SYNCPAY_CLIENT_ID/SECRET não configurados.");
  }

  const res = await fetch(`${SYNCPAY_BASE}/api/partner/v1/auth-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SyncPay auth falhou (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
    expires_at: string;
  };

  return data.access_token && (tokenCache = {
    token: data.access_token,
    // renova 1min antes para evitar expirar no meio de uma request.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }).token;
}

export async function getSyncPayToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token;
  return fetchAuthToken();
}

async function authedFetch(
  path: string,
  init: RequestInit & { retry?: boolean } = {},
): Promise<Response> {
  const token = await getSyncPayToken();
  const res = await fetch(`${SYNCPAY_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401 && !init.retry) {
    tokenCache = null;
    return authedFetch(path, { ...init, retry: true });
  }
  return res;
}

export interface SyncPayPixInput {
  /** Valor em reais (ex.: 19.90). */
  amount: number;
  client: {
    name: string;
    document: string; // CPF/CNPJ apenas dígitos
    email?: string;
  };
  externalReference: string;
  /** UTMs opcionais para tracking. */
  checkout?: Record<string, string | null>;
}

export interface SyncPayPixCharge {
  id: string;
  status: string;
  amount: number;
  paymentCode: string; // Pix copia-e-cola
  paymentCodeBase64: string; // QR base64 (sem prefixo data:)
  externalReference?: string;
}

export async function createSyncPayPix(input: SyncPayPixInput): Promise<SyncPayPixCharge> {
  const body = {
    amount: input.amount,
    external_reference: input.externalReference,
    client: input.client,
    debtor_account: {
      name: input.client.name,
      document: input.client.document,
    },
    checkout: input.checkout ?? {},
  };

  const res = await authedFetch("/api/partner/v1/cash-in", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SyncPay cash-in falhou (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  // Resposta pode vir aninhada em { data: {...} } ou flat — normalizamos.
  const payload = (data.data ?? data) as Record<string, unknown>;

  return {
    id: String(payload.id ?? payload.idtransaction ?? ""),
    status: String(payload.status ?? "pending"),
    amount: Number(payload.amount ?? input.amount),
    paymentCode: String(payload.paymentcode ?? payload.payment_code ?? ""),
    paymentCodeBase64: String(payload.paymentCodeBase64 ?? payload.qr_code_base64 ?? ""),
    externalReference: String(payload.externalreference ?? input.externalReference),
  };
}

export interface SyncPayStatus {
  id: string;
  status: string;
  amount: number;
}

export async function getSyncPayStatus(id: string): Promise<SyncPayStatus> {
  const res = await authedFetch(`/api/partner/v1/cash-in/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SyncPay status falhou (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const payload = (data.data ?? data) as Record<string, unknown>;
  return {
    id: String(payload.id ?? id),
    status: String(payload.status ?? "pending"),
    amount: Number(payload.amount ?? 0),
  };
}

/** Normaliza diferentes nomes retornados pelo SyncPay para "paid" / "pending" / "failed". */
export function isPaidStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === "paid" || s === "approved" || s === "completed" || s === "confirmed";
}

export function isFailedStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === "failed" || s === "canceled" || s === "cancelled" || s === "expired" || s === "refused";
}
