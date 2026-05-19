import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createSyncPayPix,
  getSyncPayStatus,
  isFailedStatus,
  isPaidStatus,
} from "@/integrations/syncpay/syncpay.server";

const CreatePixInput = z.object({
  amountCents: z.number().int().min(100).max(10_000_00),
  productLabel: z.string().min(1).max(120),
  externalReference: z.string().min(1).max(80),
  client: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(160),
    document: z.string().regex(/^\d{11}$|^\d{14}$/, "CPF/CNPJ inválido"),
    whatsapp: z.string().min(8).max(20).optional(),
  }),
});

export type CreatePixResponse = {
  id: string;
  paymentCode: string;
  paymentCodeBase64: string;
  status: string;
  amountCents: number;
};

export const createPixCharge = createServerFn({ method: "POST" })
  .inputValidator((input) => CreatePixInput.parse(input))
  .handler(async ({ data }): Promise<CreatePixResponse> => {
    const amount = Number((data.amountCents / 100).toFixed(2));
    const charge = await createSyncPayPix({
      amount,
      externalReference: data.externalReference,
      client: {
        name: data.client.name,
        email: data.client.email,
        document: data.client.document,
      },
    });

    if (!charge.paymentCode) {
      throw new Error("SyncPay não retornou o código Pix.");
    }

    return {
      id: charge.id,
      paymentCode: charge.paymentCode,
      paymentCodeBase64: charge.paymentCodeBase64,
      status: charge.status,
      amountCents: data.amountCents,
    };
  });

const StatusInput = z.object({ id: z.string().min(1).max(80) });

export type PixStatusResponse = {
  id: string;
  status: string;
  paid: boolean;
  failed: boolean;
};

export const getPixStatus = createServerFn({ method: "POST" })
  .inputValidator((input) => StatusInput.parse(input))
  .handler(async ({ data }): Promise<PixStatusResponse> => {
    const status = await getSyncPayStatus(data.id);
    return {
      id: status.id,
      status: status.status,
      paid: isPaidStatus(status.status),
      failed: isFailedStatus(status.status),
    };
  });
