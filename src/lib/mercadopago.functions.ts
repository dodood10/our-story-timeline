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

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "." };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

const PayerInput = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  document: z.string().regex(/^\d{11}$/, "CPF inválido"),
});

const CreatePixInput = z.object({
  amountCents: z.number().int().min(100).max(10_000_00),
  productLabel: z.string().min(1).max(120),
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
    const amount = Number((data.amountCents / 100).toFixed(2));
    const { firstName, lastName } = splitName(data.payer.name);
    const charge = await createMpPix({
      amount,
      description: data.productLabel,
      externalReference: data.externalReference,
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
    return {
      id: charge.id,
      status: charge.status,
      qrCode: charge.qrCode,
      qrCodeBase64: charge.qrCodeBase64,
      ticketUrl: charge.ticketUrl,
      amountCents: data.amountCents,
    };
  });

const CreateCardInput = z.object({
  amountCents: z.number().int().min(100).max(10_000_00),
  productLabel: z.string().min(1).max(120),
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
};

export const createMpCardCharge = createServerFn({ method: "POST" })
  .inputValidator((i) => CreateCardInput.parse(i))
  .handler(async ({ data }): Promise<MpCardResponse> => {
    const amount = Number((data.amountCents / 100).toFixed(2));
    const { firstName, lastName } = splitName(data.payer.name);
    const charge = await createMpCard({
      amount,
      description: data.productLabel,
      externalReference: data.externalReference,
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
