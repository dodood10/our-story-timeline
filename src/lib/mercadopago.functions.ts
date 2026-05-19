import { createServerFn } from "@tanstack/react-start";
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
import {
  findPaymentByExternalReference,
  recordPaymentCreated,
  updatePaymentStatus,
} from "@/lib/payments.server";

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Cliente", lastName: "MP" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
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

const CreatePixInput = z.object({
  productKey: ProductKey,
  bumps: BumpsInput.optional(),
  externalReference: z.string().min(1).max(80),
  payer: PayerInput,
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
  externalReference: z.string().min(1).max(80),
  token: z.string().min(8).max(200),
  paymentMethodId: z.string().min(2).max(40),
  installments: z.number().int().min(1).max(12),
  issuerId: z.string().min(1).max(40).optional(),
  payer: PayerInput,
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
    return {
      id: p.id,
      status: p.status,
      paid: isPaidStatus(p.status),
      failed: isFailedStatus(p.status),
    };
  });

export const getMpPublicKey = createServerFn({ method: "GET" }).handler(async () => {
  return { publicKey: getPublicKey() };
});
