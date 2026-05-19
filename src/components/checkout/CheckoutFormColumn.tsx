import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderBumpCard } from "@/components/checkout/OrderBumpCard";
import { PaymentMethodTabs } from "@/components/checkout/PaymentMethodTabs";
import { MpPixDialog } from "@/components/checkout/MpPixDialog";
import { MpCardForm } from "@/components/checkout/MpCardForm";
import { ORDER_BUMPS, type PaymentMethod, type CheckoutProductKey } from "@/lib/checkout-products";
import type { CheckoutBumps, CheckoutLead } from "@/lib/checkout-storage";
import {
  clearPendingMpPayment,
  readPendingMpPayment,
  writeCheckoutLead,
} from "@/lib/checkout-storage";
import { reconcileMpPayment } from "@/lib/mercadopago.functions";

function validateCpf(raw: string): boolean {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check >= 10) check = 0;
  if (check !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check >= 10) check = 0;
  return check === parseInt(d[10]);
}

function checkoutSchema() {
  return z.object({
    fullName: z.string().min(3, "Informe seu nome completo"),
    email: z.string().email("Informe um e-mail válido"),
    whatsapp: z.string().refine((v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11;
    }, "Informe um WhatsApp válido com DDD (ex: 11 99999-9999)"),
    cpf: z
      .string()
      .min(11, "CPF obrigatório")
      .refine(validateCpf, "CPF inválido"),
  });
}

type FormValues = z.infer<ReturnType<typeof checkoutSchema>>;

export function CheckoutFormColumn({
  bumps,
  onBumpChange,
  paymentMethod,
  onPaymentMethodChange,
  defaultLead,
  pixDialogOpen,
  onPixDialogOpenChange,
  onSubmit,
  submitting,
  hideBumps,
  submitLabel,
  amountCents,
  productLabel,
  productKey,
  externalReference,
  userId,
}: {
  bumps: CheckoutBumps;
  onBumpChange: (id: keyof CheckoutBumps, value: boolean) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  defaultLead: CheckoutLead | null;
  pixDialogOpen: boolean;
  onPixDialogOpenChange: (open: boolean) => void;
  /** Chamado quando o Mercado Pago confirma o pagamento (Pix ou cartão). */
  onSubmit: (lead: CheckoutLead) => void;
  submitting: boolean;
  hideBumps?: boolean;
  submitLabel?: string;
  amountCents: number;
  productLabel: string;
  productKey: CheckoutProductKey;
  externalReference: string;
  userId?: string | null;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(checkoutSchema()),
    defaultValues: {
      fullName: defaultLead?.fullName ?? "",
      email: defaultLead?.email ?? "",
      whatsapp: defaultLead?.whatsapp ?? "",
      cpf: defaultLead?.cpf ?? "",
    },
  });

  const values = form.watch();
  useEffect(() => {
    const { fullName, email, whatsapp, cpf } = values;
    if (!fullName && !email && !whatsapp) return;
    writeCheckoutLead({
      fullName: fullName ?? "",
      email: email ?? "",
      whatsapp: whatsapp ?? "",
      cpf: cpf || undefined,
    });
  }, [values.fullName, values.email, values.whatsapp, values.cpf]);

  // Reconciliação: se há um Pix pendente para este produto, consulta status e libera se aprovado.
  const reconcileFn = useServerFn(reconcileMpPayment);
  const reconciledRef = useRef(false);
  useEffect(() => {
    if (reconciledRef.current) return;
    const pending = readPendingMpPayment(productKey);
    if (!pending) return;
    reconciledRef.current = true;
    reconcileFn({ data: { externalReference: pending.externalReference } })
      .then((res) => {
        if (res.paid) {
          clearPendingMpPayment();
          onSubmit({
            fullName: values.fullName ?? defaultLead?.fullName ?? "",
            email: values.email ?? defaultLead?.email ?? "",
            whatsapp: values.whatsapp ?? defaultLead?.whatsapp ?? "",
            cpf: values.cpf ?? defaultLead?.cpf,
          });
        }
      })
      .catch(() => {
        /* silencioso — usuário pode pagar de novo */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productKey]);

  function handleValidPix(data: FormValues) {
    const lead: CheckoutLead = {
      fullName: data.fullName,
      email: data.email,
      whatsapp: data.whatsapp,
      cpf: data.cpf,
    };
    writeCheckoutLead(lead);
    onPixDialogOpenChange(true);
  }

  const currentLead: CheckoutLead = {
    fullName: values.fullName ?? "",
    email: values.email ?? "",
    whatsapp: values.whatsapp ?? "",
    cpf: values.cpf,
  };

  const formValid = form.formState.isValid;
  const ctaLabel = submitLabel ?? "Gerar Pix e liberar meu acesso";

  return (
    <div className="space-y-6">
      <form
        onSubmit={form.handleSubmit(handleValidPix, () => {
          import("sonner").then(({ toast }) =>
            toast.error("Revise os campos destacados antes de continuar."),
          );
        })}
        className="space-y-5"
        noValidate
      >
        <div>
          <h2 className="font-display text-xl">Seus dados</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Use o mesmo e-mail da sua conta — assim você recupera o acesso em qualquer dispositivo.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" autoComplete="name" {...form.register("fullName")} />
            {form.formState.errors.fullName && (
              <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              type="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              {...form.register("whatsapp")}
            />
            {form.formState.errors.whatsapp && (
              <p className="text-xs text-destructive">{form.formState.errors.whatsapp.message}</p>
            )}
          </div>
        </div>

        {!hideBumps && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Ofertas especiais (opcional)</h3>
            {ORDER_BUMPS.map((bump) => (
              <OrderBumpCard
                key={bump.id}
                bump={bump}
                checked={bumps[bump.id]}
                onCheckedChange={(v) => onBumpChange(bump.id, v)}
              />
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              inputMode="numeric"
              placeholder="000.000.000-00"
              aria-describedby="cpf-hint"
              {...form.register("cpf")}
            />
            <p id="cpf-hint" className="text-xs text-muted-foreground">
              Obrigatório para emitir a cobrança no seu nome.
            </p>
            {form.formState.errors.cpf && (
              <p className="text-xs text-destructive">{form.formState.errors.cpf.message}</p>
            )}
          </div>
          <h3 className="font-medium text-sm pt-2">Pagamento</h3>
          <PaymentMethodTabs value={paymentMethod} onChange={onPaymentMethodChange} />
        </div>

        {paymentMethod === "pix" ? (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground text-center" id="checkout-microcopy">
              Em poucos minutos, você terá seu acesso liberado.
            </p>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting}
              aria-describedby="checkout-microcopy checkout-access-note"
            >
              {submitting ? "Processando…" : ctaLabel}
            </Button>
            <p id="checkout-access-note" className="text-xs text-center text-muted-foreground">
              Seu acesso será liberado após a confirmação do Pix.
            </p>
          </div>
        ) : null}
      </form>

      {paymentMethod === "card" && (
        <div className="space-y-2">
          {!formValid && (
            <p className="text-xs text-muted-foreground">
              Preencha seus dados acima para liberar o pagamento no cartão.
            </p>
          )}
          <div className={formValid ? "" : "opacity-60 pointer-events-none"}>
            <MpCardForm
              amountCents={amountCents}
              productLabel={productLabel}
              productKey={productKey}
              bumps={bumps}
              externalReference={externalReference}
              userId={userId}
              lead={currentLead}
              onPaid={() => onSubmit(currentLead)}
            />
          </div>
        </div>
      )}

      <MpPixDialog
        open={pixDialogOpen}
        onOpenChange={onPixDialogOpenChange}
        amountCents={amountCents}
        productLabel={productLabel}
        productKey={productKey}
        bumps={bumps}
        lead={currentLead}
        externalReference={externalReference}
        userId={userId}
        onPaid={() => {
          onPixDialogOpenChange(false);
          onSubmit(currentLead);
        }}
      />
    </div>
  );
}
