import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/surprise/")({
  head: () => ({
    meta: [
      { title: "Comprar Surpresa Romântica" },
      { name: "description", content: "Adquira seu plano e gere a sua surpresa em minutos." },
    ],
  }),
  component: SurpriseIntro,
});

function SurpriseIntro() {
  const { surprise, setSurprise } = useAccess();
  const navigate = useNavigate();

  function purchase(tier: "basic" | "premium") {
    setSurprise(tier);
    navigate({ to: "/surprise/quiz" });
  }

  if (surprise === "basic" || surprise === "premium") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-card border border-border rounded-3xl p-8 shadow-card">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <h1 className="font-display text-3xl mt-4">Tudo pronto!</h1>
          <p className="text-muted-foreground mt-2">
            Você já tem acesso ao plano <strong>{surprise === "premium" ? "Premium" : "Básico"}</strong>. Bora gerar a surpresa?
          </p>
          <Button asChild size="lg" className="w-full mt-6">
            <Link to="/surprise/quiz">Começar o quiz <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
          <Button asChild variant="ghost" className="w-full mt-2">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-soft">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <Heart className="h-4 w-4 text-primary" /> Surpresa Romântica
        </Link>

        <div className="mt-8 text-center">
          <h1 className="font-display text-3xl sm:text-4xl">Escolha seu plano</h1>
          <p className="text-muted-foreground mt-3">Pagamento único. Acesso imediato.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <PlanCard
            name="Básico"
            price="10"
            features={["Gerador personalizado", "Decoração por ambiente", "Lista de compras", "Roteiro simples"]}
            onSelect={() => purchase("basic")}
          />
          <PlanCard
            name="Premium"
            price="19,90"
            highlight
            badge="Mais escolhido"
            features={[
              "Tudo do Básico, mais:",
              "Frases românticas",
              "Ideias de jantar",
              "Plano emergência 1h",
              "Checklist completo",
              "Exportação em PDF",
            ]}
            onSelect={() => purchase("premium")}
          />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> Pagamento simulado (modo de teste). Em breve com Stripe/Mercado Pago.
        </p>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  highlight,
  badge,
  onSelect,
}: {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
  onSelect: () => void;
}) {
  return (
    <div className={`relative rounded-3xl p-7 border bg-card ${highlight ? "border-primary shadow-soft scale-[1.02]" : "border-border"}`}>
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-2">
        {highlight && <Sparkles className="h-4 w-4 text-primary" />}
        <p className="font-display text-2xl">{name}</p>
      </div>
      <p className="mt-3">
        <span className="font-display text-5xl">R${price}</span>
        <span className="text-sm text-muted-foreground ml-1">/ único</span>
      </p>
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm">
            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button className="w-full mt-7" variant={highlight ? "default" : "outline"} onClick={onSelect}>
        Quero o {name}
      </Button>
    </div>
  );
}
