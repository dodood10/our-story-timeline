import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import { UPSELL_KIT, formatBRL, calcTotalCents, getCheckoutProduct } from "@/lib/checkout-products";
import { readCheckoutBumps, readLastProductId, writeUpsellKit } from "@/lib/checkout-storage";
import { trackEvent } from "@/lib/meta-pixel";
import {
  AccessGateDenied,
  AccessGateLoading,
  AccessGateSurpriseBlocked,
} from "@/components/surprise/AccessGate";
import { SurpriseShell } from "@/components/surprise/SurpriseShell";
import { BRAND_NAME } from "@/lib/brand";
import { CheckCircle2, Gift, Loader2, Sparkles, Timer } from "lucide-react";

export const Route = createFileRoute("/surprise/upsell")({
  head: () => ({
    meta: [{ title: `Oferta especial — ${BRAND_NAME}` }, { name: "robots", content: "noindex" }],
  }),
  component: UpsellPage,
});

const TIMER_KEY = "ml.surprise.upsell_start";
const TIMER_DURATION = 600;

function useCountdown() {
  const [remaining, setRemaining] = useState(TIMER_DURATION);

  useEffect(() => {
    let start = parseInt(sessionStorage.getItem(TIMER_KEY) ?? "0");
    if (!start) {
      start = Date.now();
      sessionStorage.setItem(TIMER_KEY, String(start));
    }
    function tick() {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setRemaining(Math.max(0, TIMER_DURATION - elapsed));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return {
    minutes: Math.floor(remaining / 60),
    seconds: String(remaining % 60).padStart(2, "0"),
    expired: remaining === 0,
  };
}

function UpsellPage() {
  const { canUseSurprise, productMode, hydrated } = useAccess();
  const navigate = useNavigate();
  const { minutes, seconds, expired } = useCountdown();

  if (!hydrated) return <AccessGateLoading />;
  if (productMode === "memory_lane_only") return <AccessGateSurpriseBlocked />;
  if (!canUseSurprise) return <AccessGateDenied />;

  const productId = readLastProductId();
  const product = getCheckoutProduct(productId);
  const bumps = readCheckoutBumps();
  const baseTotal = calcTotalCents(product, bumps);

  function accept() {
    writeUpsellKit(true);
    trackEvent("Purchase", {
      value: (baseTotal + UPSELL_KIT.priceCents) / 100,
      currency: "BRL",
      content_ids: [product.id, "upsell-kit"],
      content_type: "product",
    });
    toast.success("Kit Surpresa Premium adicionado ao seu acesso!");
    navigate({ to: "/surprise/quiz" });
  }

  function decline() {
    trackEvent("Purchase", {
      value: baseTotal / 100,
      currency: "BRL",
      content_ids: [product.id],
      content_type: "product",
    });
    navigate({ to: "/surprise/quiz" });
  }

  return (
    <SurpriseShell footer={false} mainClassName="max-w-lg mx-auto px-4 py-10 sm:py-12">
      <div className="text-center">
        <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="font-display text-3xl sm:text-4xl mt-5">Compra confirmada!</h1>
        <p className="text-muted-foreground mt-2">Antes do quiz, uma oferta exclusiva para você:</p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-destructive text-sm font-semibold">
        <Timer className="h-4 w-4" />
        {expired ? (
          <span>Oferta encerrada</span>
        ) : (
          <span>
            Oferta expira em {minutes}:{seconds}
          </span>
        )}
      </div>

      <div className="mt-4 rounded-3xl border border-primary/25 bg-card p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-2 text-primary">
          <Gift className="h-5 w-5" />
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Oferta única</span>
        </div>
        <h2 className="font-display text-2xl mt-3">{UPSELL_KIT.title}</h2>
        <p className="text-2xl font-display text-primary mt-2">
          {formatBRL(UPSELL_KIT.priceCents)}
        </p>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{UPSELL_KIT.headline}</p>
        <ul className="mt-5 space-y-2">
          {UPSELL_KIT.features.map((f) => (
            <li key={f} className="flex gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
        <Button size="lg" className="w-full mt-6" onClick={accept} disabled={expired}>
          {expired ? "Oferta encerrada" : "Sim, quero deixar minha surpresa mais completa"}
        </Button>
        <Button variant="ghost" className="w-full mt-2" onClick={decline}>
          Não, quero continuar apenas com meu acesso
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-4">
          Sem cobrança adicional neste modo de teste — apenas registramos sua escolha.
        </p>
      </div>

      <p className="text-center mt-6">
        <Link to="/surprise/quiz" className="text-sm text-muted-foreground hover:text-foreground">
          Pular e ir direto ao quiz →
        </Link>
      </p>
    </SurpriseShell>
  );
}
