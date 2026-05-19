import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import { ProductSummaryColumn } from "@/components/checkout/ProductSummaryColumn";
import { CheckoutFormColumn } from "@/components/checkout/CheckoutFormColumn";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { SurpriseShell } from "@/components/surprise/SurpriseShell";
import { BRAND_NAME } from "@/lib/brand";
import {
  calcTotalCents,
  getCheckoutProduct,
  type CheckoutProductId,
  type PaymentMethod,
} from "@/lib/checkout-products";
import {
  persistCheckoutDraft,
  readCheckoutBumps,
  readCheckoutLead,
  setBump,
  submitCheckoutMock,
  type CheckoutLead,
} from "@/lib/checkout-storage";
import { trackEvent } from "@/lib/meta-pixel";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const checkoutSearchSchema = z.object({
  plan: z.enum(["premium", "basic"]).optional(),
});

export const Route = createFileRoute("/surprise/")({
  validateSearch: (search) => checkoutSearchSchema.parse(search),
  head: () => ({
    meta: [
      {
        title: `Finalize sua compra — ${BRAND_NAME}`,
      },
      {
        name: "description",
        content: "Complete seus dados e libere o gerador de surpresa personalizada.",
      },
    ],
  }),
  component: SurpriseCheckout,
});

function SurpriseCheckout() {
  const { plan } = Route.useSearch();
  const productId: CheckoutProductId = plan ?? "premium";
  const product = getCheckoutProduct(productId);
  const { surprise, hasSurprise, applyPurchase, hydrated } = useAccess();
  const navigate = useNavigate();

  const [bumps, setBumps] = useState(readCheckoutBumps);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [pixOpen, setPixOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalCents = calcTotalCents(product, bumps);
  const defaultLead = readCheckoutLead();

  useEffect(() => {
    if (hydrated && surprise !== "basic" && surprise !== "premium") {
      trackEvent("InitiateCheckout", {
        value: totalCents / 100,
        currency: "BRL",
        content_ids: [product.id],
        content_type: "product",
      });
    }
  }, [hydrated, surprise, totalCents, product.id]);

  if (!hydrated) {
    return (
      <SurpriseShell footer={false} mainClassName="flex items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </SurpriseShell>
    );
  }

  if (hasSurprise) {
    return (
      <SurpriseShell footer={false} mainClassName="flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-card border border-border rounded-3xl p-8 shadow-card">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <h1 className="font-display text-3xl mt-4">Tudo pronto!</h1>
          <p className="text-muted-foreground mt-2">
            Você já tem acesso ao plano{" "}
            <strong>{surprise === "premium" ? "Premium" : "Básico"}</strong>.
          </p>
          <Button asChild size="lg" className="w-full mt-6">
            <Link to="/app">
              Ir para minha área <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full mt-2">
            <Link to="/surprise/quiz">Continuar surpresa (quiz)</Link>
          </Button>
        </div>
      </SurpriseShell>
    );
  }

  function handleBumpChange(id: keyof typeof bumps, value: boolean) {
    setBumps((prev) => {
      const next = { ...prev, [id]: value };
      setBump(id, value);
      return next;
    });
  }

  function completeCheckout(lead: CheckoutLead) {
    setSubmitting(true);
    persistCheckoutDraft(lead, bumps, productId);
    submitCheckoutMock();
    applyPurchase({ surpriseTier: product.tier });
    toast.success("Pagamento confirmado! Seu acesso foi liberado.");
    setPixOpen(false);
    navigate({ to: "/surprise/quiz", replace: true });
  }

  return (
    <SurpriseShell footer mainClassName="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <p className="text-sm text-muted-foreground max-w-xl">{product.subtitle}</p>

      <div className="mt-8 flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">
        <OrderSummary
          product={product}
          bumps={bumps}
          totalCents={totalCents}
          compact
          className="lg:hidden"
        />

        <ProductSummaryColumn product={product} />

        <div className="space-y-6">
          <OrderSummary
            product={product}
            bumps={bumps}
            totalCents={totalCents}
            className="hidden lg:block"
          />
          <CheckoutFormColumn
            bumps={bumps}
            onBumpChange={handleBumpChange}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            defaultLead={defaultLead}
            pixDialogOpen={pixOpen}
            onPixDialogOpenChange={setPixOpen}
            onSubmit={completeCheckout}
            submitting={submitting}
          />
        </div>
      </div>
    </SurpriseShell>
  );
}
