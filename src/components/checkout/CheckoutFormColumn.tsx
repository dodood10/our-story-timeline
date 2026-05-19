import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderBumpCard } from "@/components/checkout/OrderBumpCard";
import { PaymentMethodTabs } from "@/components/checkout/PaymentMethodTabs";
import { PixPaymentDialog } from "@/components/checkout/PixPaymentDialog";
import { ORDER_BUMPS, type PaymentMethod } from "@/lib/checkout-products";
import type { CheckoutBumps, CheckoutLead } from "@/lib/checkout-storage";
import { writeCheckoutLead } from "@/lib/checkout-storage";

function checkoutSchema() {
  return z.object({
    fullName: z.string().min(3, "Informe seu nome completo"),
    email: z.string().email("Informe um e-mail válido"),
    whatsapp: z.string().min(10, "Informe um WhatsApp válido"),
    cpf: z
      .string()
      .min(11, "CPF obrigatório para emitir o Pix")
      .refine((v) => v.replace(/\D/g, "").length === 11, "CPF inválido"),
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
  externalReference,
}: {
  bumps: CheckoutBumps;
  onBumpChange: (id: keyof CheckoutBumps, value: boolean) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  defaultLead: CheckoutLead | null;
  pixDialogOpen: boolean;
  onPixDialogOpenChange: (open: boolean) => void;
  /** Chamado quando o SyncPay confirma o pagamento. */
  onSubmit: (lead: CheckoutLead) => void;
  submitting: boolean;
  hideBumps?: boolean;
  submitLabel?: string;
  amountCents: number;
  productLabel: string;
  externalReference: string;
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

  function handleValid(data: FormValues) {
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

  const ctaLabel = submitLabel ?? "Gerar Pix e liberar meu acesso";


  return (
    <div className="space-y-6">
      <form
        onSubmit={form.handleSubmit(handleValid, () => {
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
            Usamos apenas para liberar seu acesso e enviar a confirmação.
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
          <h3 className="font-medium text-sm">Pagamento</h3>
          <PaymentMethodTabs value={paymentMethod} onChange={onPaymentMethodChange} />
          {paymentMethod === "card" && (
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF do titular</Label>
              <Input
                id="cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                aria-describedby="cpf-hint"
                {...form.register("cpf")}
              />
              <p id="cpf-hint" className="text-xs text-muted-foreground">
                Obrigatório para pagamento com cartão de crédito.
              </p>
              {form.formState.errors.cpf && (
                <p className="text-xs text-destructive">{form.formState.errors.cpf.message}</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-sm text-muted-foreground text-center" id="checkout-microcopy">
            Em poucos minutos, você terá um plano pronto para surpreender quem você ama.
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
            Seu acesso será liberado após a confirmação do pagamento.
          </p>
        </div>
      </form>

      <Dialog open={pixDialogOpen} onOpenChange={onPixDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagamento de teste (Pix)</DialogTitle>
            <DialogDescription>
              Em produção, aqui aparecerá o QR Code do Mercado Pago. Por agora, confirme para
              simular o pagamento e liberar seu acesso.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onPixDialogOpenChange(false)}>
              Voltar
            </Button>
            <Button type="button" onClick={confirmPix} disabled={submitting}>
              Confirmar pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
