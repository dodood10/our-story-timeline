/**
 * Mercado Pago server-only helpers (Checkout Transparente).
 *
 * Docs:
 *  - POST https://api.mercadopago.com/v1/payments
 *  - GET  https://api.mercadopago.com/v1/payments/{id}
 *
 * Lê MP_ACCESS_TOKEN/MP_PUBLIC_KEY DENTRO dos handlers — nunca em escopo de módulo.
 */

const MP_BASE = "https://api.mercadopago.com";

export interface MpPayer {
  email: string;
  firstName: string;
  lastName: string;
  document: string; // CPF dígitos
}

export interface MpPixCharge {
  id: string;
  status: string;
  statusDetail: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
}

export interface MpCardCharge {
  id: string;
  status: string;
  statusDetail: string;
}

function getAccessToken(): string {
  const t = process.env.MP_ACCESS_TOKEN;
  if (!t) throw new Error("MP_ACCESS_TOKEN não configurado.");
  return t;
}

export function getPublicKey(): string {
  const k = process.env.MP_PUBLIC_KEY;
  if (!k) throw new Error("MP_PUBLIC_KEY não configurado.");
  return k;
}

async function mpFetch<T>(path: string, init: RequestInit & { idempotencyKey?: string } = {}): Promise<T> {
  const { idempotencyKey, headers, ...rest } = init;
  const res = await fetch(`${MP_BASE}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && "message" in body && (body as { message?: string }).message) ||
      `HTTP ${res.status}`;
    throw new Error(`Mercado Pago ${path} falhou: ${msg}`);
  }
  return body as T;
}

export async function createMpPix(input: {
  amount: number;
  description: string;
  externalReference: string;
  idempotencyKey?: string;
  payer: MpPayer;
}): Promise<MpPixCharge> {
  const body = {
    transaction_amount: input.amount,
    description: input.description,
    payment_method_id: "pix",
    external_reference: input.externalReference,
    payer: {
      email: input.payer.email,
      first_name: input.payer.firstName,
      last_name: input.payer.lastName,
      identification: { type: "CPF", number: input.payer.document },
    },
  };
  const data = await mpFetch<{
    id: number | string;
    status: string;
    status_detail: string;
    point_of_interaction?: {
      transaction_data?: {
        qr_code?: string;
        qr_code_base64?: string;
        ticket_url?: string;
      };
    };
  }>("/v1/payments", {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey: input.idempotencyKey ?? crypto.randomUUID(),
  });

  const tx = data.point_of_interaction?.transaction_data ?? {};
  return {
    id: String(data.id),
    status: data.status,
    statusDetail: data.status_detail ?? "",
    qrCode: tx.qr_code ?? "",
    qrCodeBase64: tx.qr_code_base64 ?? "",
    ticketUrl: tx.ticket_url ?? "",
  };
}

export async function createMpCard(input: {
  amount: number;
  description: string;
  externalReference: string;
  idempotencyKey?: string;
  token: string;
  paymentMethodId: string;
  installments: number;
  issuerId?: string;
  payer: MpPayer;
}): Promise<MpCardCharge> {
  const body: Record<string, unknown> = {
    transaction_amount: input.amount,
    description: input.description,
    token: input.token,
    installments: input.installments,
    payment_method_id: input.paymentMethodId,
    external_reference: input.externalReference,
    // binary_mode evita estados "in_process" — banco aprova ou recusa de imediato.
    binary_mode: true,
    payer: {
      email: input.payer.email,
      first_name: input.payer.firstName,
      last_name: input.payer.lastName,
      identification: { type: "CPF", number: input.payer.document },
    },
  };
  if (input.issuerId) body.issuer_id = input.issuerId;

  const data = await mpFetch<{
    id: number | string;
    status: string;
    status_detail: string;
  }>("/v1/payments", {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey: input.idempotencyKey ?? crypto.randomUUID(),
  });

  return {
    id: String(data.id),
    status: data.status,
    statusDetail: data.status_detail ?? "",
  };
}


export async function getMpPayment(id: string): Promise<{ id: string; status: string; statusDetail: string }> {
  const data = await mpFetch<{ id: number | string; status: string; status_detail: string }>(
    `/v1/payments/${encodeURIComponent(id)}`,
    { method: "GET" },
  );
  return { id: String(data.id), status: data.status, statusDetail: data.status_detail ?? "" };
}

export function isPaidStatus(s: string): boolean {
  return s === "approved";
}
export function isFailedStatus(s: string): boolean {
  return s === "rejected" || s === "cancelled" || s === "refunded" || s === "charged_back";
}

/** Mensagens em PT-BR para os principais status_detail de cartão. */
export function translateCardStatusDetail(detail: string): string {
  const map: Record<string, string> = {
    accredited: "Pagamento aprovado.",
    pending_contingency: "Pagamento em análise. Avisaremos por e-mail.",
    pending_review_manual: "Pagamento em revisão manual.",
    cc_rejected_bad_filled_card_number: "Número do cartão inválido.",
    cc_rejected_bad_filled_date: "Data de validade inválida.",
    cc_rejected_bad_filled_security_code: "Código de segurança inválido.",
    cc_rejected_bad_filled_other: "Verifique os dados do cartão.",
    cc_rejected_call_for_authorize: "Autorize esta compra com seu banco e tente novamente.",
    cc_rejected_card_disabled: "Cartão desabilitado. Contate seu banco.",
    cc_rejected_duplicated_payment: "Pagamento duplicado. Aguarde antes de tentar de novo.",
    cc_rejected_high_risk: "Pagamento recusado por segurança. Tente outro cartão.",
    cc_rejected_insufficient_amount: "Saldo/limite insuficiente.",
    cc_rejected_invalid_installments: "Esse cartão não aceita esse número de parcelas.",
    cc_rejected_max_attempts: "Muitas tentativas. Tente outro cartão.",
    cc_rejected_other_reason: "O banco recusou o pagamento. Tente outro cartão.",
  };
  return map[detail] ?? "Pagamento recusado pelo banco. Tente outro cartão.";
}
