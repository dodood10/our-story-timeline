import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  createMpCard,
  createMpPix,
  getMpPayment,
  getPublicKey,
  isFailedStatus,
  isPaidStatus,
  translateCardStatusDetail,
} from "@/lib/mercadopago.server";
import { resolveCheckoutAmountCents } from "@/lib/checkout-products";
import { grantEntitlementsFromPayment } from "@/lib/entitlements.server";
import {
  findPaymentById,
  findPaymentByExternalReference,
  markCapiPurchaseSent,
  recordPaymentCreated,
  updatePaymentStatus,
} from "@/lib/payments.server";
import { sendMetaPurchase } from "@/lib/meta-capi.server";

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Cliente", lastName: "MP" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/** Captura IP, user-agent do request atual (server fn). */
function captureClientContext(): { clientIp: string | null; clientUa: string | null } {
  try {
    const ip = getRequestIP({ xForwardedFor: true }) ?? null;
    const ua = getRequestHeader("user-agent") ?? null;
    return { clientIp: ip, clientUa: ua };
  } catch {
    return { clientIp: null, clientUa: null };
  }
}

const PayerInput = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  document: z.string().regex(/^\d{11}$/, "CPF inválido"),
});

const ProductKey = z.enum(["surprise:premium", "surprise:basic", "memory_lane"]);
const BumpsInput = z
  .object({ cards: z.boolean().optional(), phrases: z.boolean().optional() })
  .default({});

const TrackingInput = z
  .object({
    fbp: z.string().max(200).optional(),
    fbc: z.string().max(400).optional(),
    eventSourceUrl: z.string().url().max(500).optional(),
  })
  .optional();

const CreatePixInput = z.object({
  productKey: ProductKey,
  bumps: BumpsInput.optional(),
  externalReference: z.string().min(1).max(120),
  payer: PayerInput,
  userId: z.string().uuid().optional(),
  tracking: TrackingInput,
});

export type MpPixResponse = {
  id: string;
  status: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
  amountCents: number;
};

export const createMpPixCharge = createServerFn({ method: "POST" })
  .inputValidator((i) => CreatePixInput.parse(i))
  .handler(async ({ data }): Promise<MpPixResponse> => {
    const { amountCents, label } = resolveCheckoutAmountCents(data.productKey, data.bumps ?? {});
    const amount = Number((amountCents / 100).toFixed(2));
    const { firstName, lastName } = splitName(data.payer.name);
    const { clientIp, clientUa } = captureClientContext();
    const charge = await createMpPix({
      amount,
      description: label,
      externalReference: data.externalReference,
      idempotencyKey: `pix:${data.externalReference}`,
      payer: {
        email: data.payer.email,
        firstName,
        lastName,
        document: data.payer.document,
      },
    });
    if (!charge.qrCode) {
      throw new Error("Mercado Pago não retornou o código Pix.");
    }
    await recordPaymentCreated({
      id: charge.id,
      externalReference: data.externalReference,
      status: charge.status,
      amountCents,
      productKey: data.productKey,
      payerEmail: data.payer.email,
      paymentMethod: "pix",
      userId: data.userId,
      fbp: data.tracking?.fbp ?? null,
      fbc: data.tracking?.fbc ?? null,
      clientIp,
      clientUa,
    });
    return {
      id: charge.id,
      status: charge.status,
      qrCode: charge.qrCode,
      qrCodeBase64: charge.qrCodeBase64,
      ticketUrl: charge.ticketUrl,
      amountCents,
    };
  });

const CreateCardInput = z.object({
  productKey: ProductKey,
  bumps: BumpsInput.optional(),
  externalReference: z.string().min(1).max(120),
  userId: z.string().uuid().optional(),
  token: z.string().min(8).max(200),
  paymentMethodId: z.string().min(2).max(40),
  installments: z.number().int().min(1).max(12),
  issuerId: z.string().min(1).max(40).optional(),
  payer: PayerInput,
  tracking: TrackingInput,
});

export type MpCardResponse = {
  id: string;
  status: string;
  statusDetail: string;
  message: string;
  paid: boolean;
  failed: boolean;
  amountCents: number;
};

export const createMpCardCharge = createServerFn({ method: "POST" })
  .inputValidator((i) => CreateCardInput.parse(i))
  .handler(async ({ data }): Promise<MpCardResponse> => {
    const { amountCents, label } = resolveCheckoutAmountCents(data.productKey, data.bumps ?? {});
    const amount = Number((amountCents / 100).toFixed(2));
    const { firstName, lastName } = splitName(data.payer.name);
    const { clientIp, clientUa } = captureClientContext();
    const charge = await createMpCard({
      amount,
      description: label,
      externalReference: data.externalReference,
      idempotencyKey: `card:${data.externalReference}:${data.token}`,
      token: data.token,
      paymentMethodId: data.paymentMethodId,
      installments: data.installments,
      issuerId: data.issuerId,
      payer: {
        email: data.payer.email,
        firstName,
        lastName,
        document: data.payer.document,
      },
    });
    await recordPaymentCreated({
      id: charge.id,
      externalReference: data.externalReference,
      status: charge.status,
      amountCents,
      productKey: data.productKey,
      payerEmail: data.payer.email,
      paymentMethod: "card",
      userId: data.userId,
      fbp: data.tracking?.fbp ?? null,
      fbc: data.tracking?.fbc ?? null,
      clientIp,
      clientUa,
    });
    if (isPaidStatus(charge.status)) {
      await grantEntitlementsFromPayment({
        userId: data.userId ?? null,
        payerEmail: data.payer.email,
        productKey: data.productKey,
        externalReference: data.externalReference,
      });
      // Envio idempotente do Purchase ao Meta CAPI (dedup pelo event_id).
      if (await markCapiPurchaseSent(charge.id)) {
        await sendMetaPurchase({
          eventId: charge.id,
          amountCents,
          contentId: data.productKey,
          eventSourceUrl: data.tracking?.eventSourceUrl,
          user: {
            email: data.payer.email,
            firstName,
            lastName,
            cpf: data.payer.document,
            fbp: data.tracking?.fbp ?? null,
            fbc: data.tracking?.fbc ?? null,
            clientIp,
            userAgent: clientUa,
          },
        });
      }
    }
    return {
      id: charge.id,
      status: charge.status,
      statusDetail: charge.statusDetail,
      message: translateCardStatusDetail(charge.statusDetail),
      paid: isPaidStatus(charge.status),
      failed: isFailedStatus(charge.status),
      amountCents,
    };
  });

const StatusInput = z.object({ id: z.string().min(1).max(80) });

export type MpStatusResponse = {
  id: string;
  status: string;
  paid: boolean;
  failed: boolean;
};

export const getMpPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((i) => StatusInput.parse(i))
  .handler(async ({ data }): Promise<MpStatusResponse> => {
    const p = await getMpPayment(data.id);
    await updatePaymentStatus({ id: p.id, status: p.status });
    // Garante entitlements imediatamente quando o polling detecta pagamento aprovado,
    // sem depender exclusivamente do webhook (que pode chegar com atraso).
    if (isPaidStatus(p.status)) {
      const row = await findPaymentById(p.id);
      if (row) {
        await grantEntitlementsFromPayment({
          userId: row.user_id,
          payerEmail: row.payer_email,
          productKey: row.product_key,
          externalReference: row.external_reference,
        });
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
    return {
      id: p.id,
      status: p.status,
      paid: isPaidStatus(p.status),
      failed: isFailedStatus(p.status),
    };
  });

const ReconcileInput = z.object({ externalReference: z.string().min(1).max(120) });

export type MpReconcileResponse = {
  found: boolean;
  paid: boolean;
  status: string | null;
  productKey: string | null;
  amountCents: number | null;
};

/** Reconciliação por external_reference — usado quando o usuário volta após fechar a aba. */
export const reconcileMpPayment = createServerFn({ method: "POST" })
  .inputValidator((i) => ReconcileInput.parse(i))
  .handler(async ({ data }): Promise<MpReconcileResponse> => {
    const row = await findPaymentByExternalReference(data.externalReference);
    if (!row) {
      return { found: false, paid: false, status: null, productKey: null, amountCents: null };
    }
    // Se ainda não está aprovado, consulta o MP para pegar o status mais novo.
    let status = row.status;
    if (!isPaidStatus(status) && !isFailedStatus(status)) {
      try {
        const fresh = await getMpPayment(row.id);
        status = fresh.status;
        await updatePaymentStatus({ id: row.id, status });
      } catch {
        /* mantém status antigo */
      }
    }
    const paid = isPaidStatus(status);
    if (paid) {
      await grantEntitlementsFromPayment({
        userId: row.user_id,
        payerEmail: row.payer_email,
        productKey: row.product_key,
        externalReference: row.external_reference,
      });
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
    return {
      found: true,
      paid,
      status,
      productKey: row.product_key,
      amountCents: row.amount_cents,
    };
  });

export const getMpPublicKey = createServerFn({ method: "GET" }).handler(async () => {
  return { publicKey: getPublicKey() };
});
