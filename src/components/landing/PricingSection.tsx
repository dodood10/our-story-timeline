import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL, getCheckoutProduct } from "@/lib/checkout-products";
import { isPreValentinesPromo, pricing } from "@/lib/landing-content";

const basic = getCheckoutProduct("basic");
const premium = getCheckoutProduct("premium");

export function PricingSection() {
  const showPromo = isPreValentinesPromo();

  return (
    <section id="precos" className="py-16 sm:py-24 bg-card/50 scroll-mt-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl">{pricing.title}</h2>
          {showPromo && (
            <p className="mt-4 text-sm text-amber-800 dark:text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              🏷️ {pricing.promoBefore}
            </p>
          )}
        </div>

        <div className="mt-8 max-w-xl mx-auto text-center rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <p className="font-medium text-sm">⚠️ {pricing.urgency.title}</p>
          {pricing.urgency.paragraphs.map((p) => (
            <p key={p} className="text-sm text-muted-foreground mt-2">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <PricingCard
            emoji="🥉"
            name="Plano Básico"
            tagline={pricing.basicTagline}
            product={basic}
            features={pricing.basicCardFeatures}
            highlight={false}
            ctaLabel="Quero o Básico"
          />
          <PricingCard
            emoji="🥇"
            name="Plano Premium"
            tagline={pricing.premiumTagline}
            product={premium}
            features={pricing.premiumCardFeatures}
            highlight
            badge="⭐ MAIS COMPLETO"
            installment="ou 3x de R$ 6,63"
            ctaLabel={pricing.premiumCta}
          />
        </div>

        <div className="mt-10 max-w-xl mx-auto text-center rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-xl">{pricing.guarantee.title}</h3>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            {pricing.guarantee.body}
          </p>
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          💡 {pricing.anchor}
        </p>
        <p className="text-center mt-4 text-xs text-muted-foreground">🔒 {pricing.trustLine}</p>
        {!showPromo && (
          <p className="text-center mt-2 text-xs text-muted-foreground">{pricing.promoAfter}</p>
        )}
      </div>
    </section>
  );
}

function PricingCard({
  emoji,
  name,
  tagline,
  product,
  features,
  highlight,
  badge,
  installment,
  ctaLabel,
}: {
  emoji: string;
  name: string;
  tagline: string;
  product: ReturnType<typeof getCheckoutProduct>;
  features: readonly string[];
  highlight: boolean;
  badge?: string;
  installment?: string;
  ctaLabel: string;
}) {
  return (
    <div
      className={`relative rounded-3xl p-7 border ${
        highlight ? "border-primary bg-card shadow-soft md:scale-[1.02]" : "border-border bg-card"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium whitespace-nowrap">
          {badge}
        </span>
      )}
      <p className="text-2xl">{emoji}</p>
      <p className="font-display text-2xl mt-2">{name}</p>
      <p className="text-xs text-muted-foreground mt-1">{tagline}</p>
      <p className="mt-4">
        <span className="text-sm text-muted-foreground line-through mr-2">
          {formatBRL(product.compareAtCents)}
        </span>
        <span className="font-display text-4xl sm:text-5xl">{formatBRL(product.priceCents)}</span>
      </p>
      {installment && <p className="text-xs text-muted-foreground mt-1">{installment}</p>}
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm">
            <CheckCircle2
              className={`h-4 w-4 shrink-0 mt-0.5 ${highlight ? "text-primary" : "text-muted-foreground"}`}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button asChild className="w-full mt-7" variant={highlight ? "default" : "outline"} size="lg">
        <Link to="/surprise" search={{ plan: product.id }}>
          {highlight ? `💝 ${ctaLabel} →` : ctaLabel}
        </Link>
      </Button>
    </div>
  );
}
