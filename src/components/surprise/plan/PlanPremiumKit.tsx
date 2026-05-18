import { Gift, UtensilsCrossed, Zap } from "lucide-react";
import type { SurprisePlan } from "@/lib/surprise-types";
import { PlanPremiumGate } from "./PlanPremiumGate";
import { PLAN_COPY } from "./plan-copy";

const FALLBACK_THEMES = [
  { name: "Cantinho do Cinema", items: "Mantas, pipoca, projetor ou TV, almofadas no chão" },
  { name: "Jardim de Velas", items: "Velas brancas espalhadas, flores no chão, pétalas de rosa" },
  { name: "Noite de Spa", items: "Toalhas felpudas, óleos aromáticos, música suave, velas" },
  { name: "Piquenique Indoor", items: "Tapete no chão, cesta, frutas, queijos e snacks favoritos" },
  { name: "Estilo Pinterest", items: "Guirlandas de luz, balões, florzinhas, letras luminosas" },
  { name: "Degustação Íntima", items: "Mesa baixa com vinho, queijos, uvas e iluminação âmbar" },
  { name: "Café da Manhã Especial", items: "Bandeja com bilhete, flor e comida favorita" },
  { name: "Banheiro Romântico", items: "Espuma de banho, velas, sais aromáticos, toalha morna" },
  { name: "Noite Estrelada", items: "Luzes azuis no teto, cobertor, música tranquila" },
  { name: "Jantar à Luz de Velas", items: "Toalha, 2 velas, prataria, prato especial" },
];

const FALLBACK_PLAYLISTS = [
  { mood: "Romântico", tip: "Bossa nova instrumental, jazz suave, MPB lenta" },
  { mood: "Sensual", tip: "R&B lento, soul, voz baixa" },
  { mood: "Fofo", tip: "Pop acústico, MPB leve" },
  { mood: "Nostalgia", tip: "Músicas do início do relacionamento" },
];

const FALLBACK_GIFTS = [
  { range: "Até R$30", ideas: "Chocolate artesanal + cartão · Flores do mercado" },
  { range: "Até R$60", ideas: "Vinho + taças · Kit spa básico" },
  { range: "Até R$100", ideas: "Perfume favorito · Jantar temático em casa" },
];

interface PlanPremiumKitProps {
  extras: SurprisePlan["premiumExtras"];
  isPremium: boolean;
}

export function PlanPremiumKit({ extras, isPremium }: PlanPremiumKitProps) {
  const themes =
    extras.decorationThemes.length >= 10
      ? extras.decorationThemes
      : extras.decorationThemes.length > 0
        ? [...extras.decorationThemes, ...FALLBACK_THEMES].slice(0, 10)
        : FALLBACK_THEMES;

  const playlists = extras.playlists.length > 0 ? extras.playlists : FALLBACK_PLAYLISTS;
  const gifts = extras.giftsByBudget.length > 0 ? extras.giftsByBudget : FALLBACK_GIFTS;
  const cards = extras.cardTemplates;
  const scripts = extras.extraScripts;
  const dinners = extras.dinnerIdeas;
  const emergency = extras.emergencyPlan;

  const hasAiContent =
    extras.decorationThemes.length > 0 || extras.playlists.length > 0 || dinners.length > 0;

  return (
    <PlanPremiumGate
      id="premium-kit"
      icon={Gift}
      title={PLAN_COPY.premiumKit}
      isPremium={isPremium}
    >
      <div className="rounded-2xl border-2 border-amber-400/35 bg-gradient-to-b from-amber-50/80 to-background dark:from-amber-950/30 p-4 sm:p-6 space-y-6">
        <KitBlock title="10 temas de decoração prontos" icon="🏠">
          <div className="grid sm:grid-cols-2 gap-2">
            {themes.map((t) => (
              <div
                key={t.name}
                className="rounded-xl bg-white/80 dark:bg-white/5 border border-amber-200/50 dark:border-amber-800/40 p-3"
              >
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.items}</p>
              </div>
            ))}
          </div>
        </KitBlock>

        <KitBlock title="Playlists por clima" icon="🎵">
          <div className="grid sm:grid-cols-2 gap-2">
            {playlists.map((p) => (
              <div
                key={p.mood}
                className="rounded-xl bg-white/80 dark:bg-white/5 border border-amber-200/50 p-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  {p.mood}
                </p>
                <p className="text-sm mt-1">{p.tip}</p>
              </div>
            ))}
          </div>
        </KitBlock>

        <KitBlock title="Presentes por orçamento" icon="🎀">
          <div className="space-y-2">
            {gifts.map((g) => (
              <div key={g.range} className="flex gap-3 text-sm items-start">
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/40 text-xs font-medium">
                  {g.range}
                </span>
                <span className="text-muted-foreground">{g.ideas}</span>
              </div>
            ))}
          </div>
        </KitBlock>

        {cards.length > 0 && (
          <KitBlock title="Modelos de bilhete" icon="💌">
            <div className="space-y-2">
              {cards.map((t, i) => (
                <p
                  key={i}
                  className="text-sm italic text-muted-foreground rounded-xl border border-amber-200/40 p-3 bg-white/60 dark:bg-white/5"
                >
                  &ldquo;{t}&rdquo;
                </p>
              ))}
            </div>
          </KitBlock>
        )}

        {scripts.length > 0 && (
          <KitBlock title="Roteiros extras" icon="📜">
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
              {scripts.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </KitBlock>
        )}

        {(dinners.length > 0 || !hasAiContent) && (
          <KitBlock title="Ideias de jantar" icon={<UtensilsCrossed className="h-4 w-4 inline" />}>
            <ul className="space-y-1.5 text-sm">
              {(dinners.length > 0
                ? dinners
                : [
                    "Risoto simples com vinho branco",
                    "Massa ao molho pesto com salada",
                    "Board de queijos e frutas",
                  ]
              ).map((d, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  {d}
                </li>
              ))}
            </ul>
          </KitBlock>
        )}

        {(emergency.length > 0 || isPremium) && (
          <KitBlock title="Plano emergência (1 hora)" icon={<Zap className="h-4 w-4 inline" />}>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
              {(emergency.length > 0
                ? emergency
                : [
                    "Escureça o ambiente com luzes de celular ou abajures",
                    "Velas + música na TV em 5 minutos",
                    "Pedido delivery elegante se faltar comida",
                    "Bilhete escrito à mão no centro da mesa",
                    "Foque na presença, não na perfeição",
                  ]
              ).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </KitBlock>
        )}
      </div>
    </PlanPremiumGate>
  );
}

function KitBlock({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}
