import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import { CheckoutFormColumn } from "@/components/checkout/CheckoutFormColumn";
import { SurpriseShell } from "@/components/surprise/SurpriseShell";
import { formatBRL, getMemoryLaneProduct, type PaymentMethod } from "@/lib/checkout-products";
import {
  persistCheckoutDraft,
  readCheckoutBumps,
  readCheckoutLead,
  submitCheckoutMock,
  type CheckoutBumps,
  type CheckoutLead,
} from "@/lib/checkout-storage";
import { trackEvent } from "@/lib/meta-pixel";
import { CheckCircle2, ArrowRight, Loader2, Heart, RefreshCw } from "lucide-react";
import { deriveSubscriptionUiState, formatNextChargeDate } from "@/lib/memory-lane-subscription";

const searchSchema = z.object({
  upgrade: z.boolean().optional(),
});

export const Route = createFileRoute("/memory-lane/")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Memory Lane — Diário do casal" },
      { name: "description", content: "Guarde a história de vocês em um só lugar." },
    ],
  }),
  component: MemoryLaneCheckout,
});

function MemoryLaneCheckout() {
  const { upgrade } = Route.useSearch();
  const product = getMemoryLaneProduct();
  const { canUseMemoryLane, productMode, applyPurchase, hydrated, subscription } = useAccess();
  const navigate = useNavigate();

  const emptyBumps: CheckoutBumps = { cards: false, phrases: false };
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [pixOpen, setPixOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const defaultLead = readCheckoutLead();
  const memoryLaneExternalRef = useMemo(
    () => `memory-lane-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  const isUpgrade = upgrade === true && productMode === "surprise_only";
  const subState = deriveSubscriptionUiState(subscription);
  const isReactivation = subState === "lapsed";

  useEffect(() => {
    if (hydrated && !canUseMemoryLane) {
      trackEvent("InitiateCheckout", {
        value: product.priceCents / 100,
        currency: "BRL",
        content_ids: ["memory_lane"],
        content_type: "product",
      });
    }
  }, [hydrated, canUseMemoryLane, product.priceCents]);

  if (!hydrated) {
    return (
      <SurpriseShell footer={false} mainClassName="flex items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </SurpriseShell>
    );
  }

  if (canUseMemoryLane) {
    return (
      <SurpriseShell footer={false} mainClassName="flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-card border border-border rounded-3xl p-8 shadow-card">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <h1 className="font-display text-3xl mt-4">Memory Lane ativo</h1>
          <p className="text-muted-foreground mt-2">
            Sua assinatura mensal está ativa.
            {subscription && (
              <>
                {" "}
                Próxima cobrança em{" "}
                <strong className="text-foreground">{formatNextChargeDate(subscription)}</strong>.
              </>
            )}
          </p>
          <Button asChild size="lg" className="w-full mt-6">
            <Link to="/app">
              Ir para minha área <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground">
            <Link to="/settings">Gerenciar assinatura</Link>
          </Button>
        </div>
      </SurpriseShell>
    );
  }

  function completeCheckout(lead: CheckoutLead) {
    setSubmitting(true);
    persistCheckoutDraft(lead, emptyBumps, "premium");
    applyPurchase({ memoryLaneOnly: true });
    submitCheckoutMock();
    const message = isReactivation
      ? "Assinatura reativada! Memory Lane liberado."
      : "Pagamento confirmado! Memory Lane liberado.";
    toast.success(message);
    setPixOpen(false);
    navigate({ to: "/app", replace: true });
  }

  const heading = isUpgrade
    ? "Adicionar Memory Lane à sua conta"
    : isReactivation
      ? "Reativar assinatura"
      : product.title;

  const ctaPix = isReactivation
    ? "Gerar Pix e reativar (R$ 29,90/mês)"
    : isUpgrade
      ? "Gerar Pix e ativar minha assinatura"
      : "Gerar Pix e ativar minha assinatura";

  return (
    <SurpriseShell footer mainClassName="max-w-2xl mx-auto px-4 py-8 sm:py-10">
      <div className="flex items-center gap-2 mb-2">
        {isReactivation ? (
          <RefreshCw className="h-5 w-5 text-primary" />
        ) : (
          <Heart className="h-5 w-5 text-primary fill-primary/20" />
        )}
        <span className="text-sm font-medium text-primary">
          {isReactivation ? "Reativar Memory Lane" : "Memory Lane"}
        </span>
      </div>
      <h1 className="font-display text-3xl">{heading}</h1>
      <p className="text-muted-foreground mt-2">{product.subtitle}</p>

      {isUpgrade && (
        <p className="mt-4 text-sm rounded-xl bg-secondary/50 border border-border p-3">
          Você mantém sua surpresa romântica e desbloqueia o diário do casal no mesmo lugar.
        </p>
      )}

      {isReactivation && (
        <p className="mt-4 text-sm rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 p-3">
          Sua assinatura anterior venceu. Suas memórias seguem salvas neste dispositivo — basta
          reativar para voltar a abrir a linha do tempo.
        </p>
      )}

      <ul className="mt-6 space-y-2 text-sm">
        {product.features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-primary">•</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex justify-between items-baseline gap-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-display text-3xl">{formatBRL(product.priceCents)}</span>
            <span className="text-sm text-muted-foreground">{product.priceSuffix}</span>
          </div>
          <span className="text-sm text-muted-foreground line-through">
            {formatBRL(product.compareAtCents)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{product.billingNote}</p>
      </div>

      <div className="mt-8">
        <CheckoutFormColumn
          amountCents={product.priceCents}
          productLabel={product.title}
          productKey="memory_lane"
          externalReference={memoryLaneExternalRef}
          bumps={emptyBumps}
          onBumpChange={() => {}}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          defaultLead={defaultLead}
          pixDialogOpen={pixOpen}
          onPixDialogOpenChange={setPixOpen}
          onSubmit={completeCheckout}
          submitting={submitting}
          hideBumps
          submitLabel={ctaPix}
        />
      </div>
    </SurpriseShell>
  );
}
