import { CheckCircle2, Heart, Sparkles, ShieldCheck, Lock, Zap } from "lucide-react";
import type { CheckoutProduct } from "@/lib/checkout-products";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export function ProductSummaryColumn({ product }: { product: CheckoutProduct }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-6 sm:p-8 shadow-soft">
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-xs aspect-[4/3] rounded-2xl bg-card/80 border border-border flex flex-col items-center justify-center gap-3 p-6">
            <Heart className="h-12 w-12 text-primary fill-primary/20" strokeWidth={1.5} />
            <Sparkles className="h-6 w-6 text-primary absolute top-4 right-4 opacity-80" />
            <p className="font-display text-center text-lg leading-tight">{product.title}</p>
            <p className="text-xs text-center text-muted-foreground">
              {BRAND_NAME} · {BRAND_TAGLINE}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl sm:text-3xl">{product.title}</h2>
        <p className="text-sm text-muted-foreground mt-2">Você vai receber:</p>
        <ul className="mt-4 space-y-2.5">
          {product.features.map((f) => (
            <li key={f} className="flex gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground mt-5 leading-relaxed">{product.tagline}</p>
      </div>

      <div className="rounded-2xl bg-secondary/50 border border-border p-4 space-y-3">
        <p className="text-sm flex gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>
            <strong className="font-medium text-foreground">Garantia de 7 dias:</strong> se o
            material não te ajudar a montar uma surpresa mais bonita e organizada, você pode
            solicitar reembolso dentro do prazo.
          </span>
        </p>
        <p className="text-sm flex gap-2">
          <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>
            <strong className="font-medium text-foreground">Compra segura.</strong> Seus dados são
            usados apenas para liberar seu acesso e enviar as informações da compra.
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { icon: Zap, label: "Acesso imediato" },
          { icon: Lock, label: "Compra segura" },
          { icon: ShieldCheck, label: "Garantia 7 dias" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
