import { Link } from "@tanstack/react-router";
import { Heart, Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccess, type SubscriptionUiState } from "@/hooks/useAccess";
import { BRAND_NAME } from "@/lib/brand";
import { formatBRL, MEMORY_LANE_PRODUCT } from "@/lib/checkout-products";
import { formatNextChargeDate, daysUntil } from "@/lib/memory-lane-subscription";

export function ProductHub({ variant = "full" }: { variant?: "full" | "compact" }) {
  const {
    surprise,
    isPremium,
    canUseSurprise,
    canUseMemoryLane,
    productMode,
    subscription,
    subscriptionState,
  } = useAccess();
  const compact = variant === "compact";

  return (
    <div className={compact ? "space-y-3" : "space-y-6"}>
      {!compact && (
        <header>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Minha área</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-1">Seus produtos</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-lg">
            Tudo o que você comprou em um só lugar. Cada produto é independente — desbloqueie o que
            fizer sentido para vocês.
          </p>
        </header>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <SurpriseProductCard
          active={canUseSurprise}
          locked={productMode === "memory_lane_only"}
          tier={surprise}
          isPremium={isPremium}
          compact={compact}
        />
        <MemoryLaneProductCard
          active={canUseMemoryLane}
          locked={productMode === "surprise_only"}
          compact={compact}
          subscriptionState={subscriptionState}
          nextChargeLabel={subscription ? formatNextChargeDate(subscription) : null}
          remainingDays={subscription ? daysUntil(subscription.currentPeriodEnd) : null}
        />
      </div>
    </div>
  );
}

function SurpriseProductCard({
  active,
  locked,
  tier,
  isPremium,
  compact,
}: {
  active: boolean;
  locked: boolean;
  tier: string;
  isPremium: boolean;
  compact?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border flex flex-col h-full ${compact ? "p-4" : "p-5"} ${
        active
          ? "border-primary/30 bg-gradient-to-br from-primary/5 to-card shadow-card"
          : "border-border bg-card/80"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
          {locked ? (
            <Lock className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Sparkles className="h-5 w-5 text-primary" />
          )}
        </div>
        {active && (
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            Ativo
          </span>
        )}
      </div>

      <h2 className="font-display text-xl mt-4">{BRAND_NAME}</h2>
      <p className="text-sm text-muted-foreground mt-1 flex-1">
        {locked
          ? "O gerador de surpresa romântica é vendido separadamente do Memory Lane."
          : "Plano personalizado: decoração, compras, cronograma e frases para a noite."}
      </p>

      {active && !locked && (
        <p className="text-xs text-muted-foreground mt-2">
          Plano {isPremium ? "Premium" : "Básico"}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {locked ? (
          <Button asChild className="w-full">
            <Link to="/surprise" search={{ plan: "premium" }}>
              Comprar surpresa romântica
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild className="w-full">
              <Link to="/surprise/quiz">
                {tier === "none" ? "Começar" : "Refazer quiz"}{" "}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/surprise/plan">Ver meu plano</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground">
              <Link to="/surprise/upsell">Kit surpresa extra</Link>
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

function MemoryLaneProductCard({
  active,
  locked,
  compact,
  subscriptionState,
  nextChargeLabel,
  remainingDays,
}: {
  active: boolean;
  locked: boolean;
  compact?: boolean;
  subscriptionState: SubscriptionUiState;
  nextChargeLabel: string | null;
  remainingDays: number | null;
}) {
  const monthly = `${formatBRL(MEMORY_LANE_PRODUCT.priceCents)}${MEMORY_LANE_PRODUCT.priceSuffix}`;
  const isCanceling = subscriptionState === "canceling";
  const isLapsed = subscriptionState === "lapsed";
  const badgeLabel =
    subscriptionState === "active"
      ? "Assinatura ativa"
      : isCanceling
        ? "Cancelada"
        : isLapsed
          ? "Vencida"
          : null;

  return (
    <article
      className={`rounded-2xl border flex flex-col h-full ${compact ? "p-4" : "p-5"} ${
        active
          ? "border-primary/30 bg-gradient-to-br from-primary/5 to-card shadow-card"
          : "border-border bg-card/80"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
          {locked ? (
            <Lock className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Heart className="h-5 w-5 text-primary fill-primary/20" />
          )}
        </div>
        {badgeLabel && (
          <span
            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium ${
              subscriptionState === "active"
                ? "bg-primary/10 text-primary"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
            }`}
          >
            {badgeLabel}
          </span>
        )}
      </div>

      <h2 className="font-display text-xl mt-4">Memory Lane</h2>
      <p className="text-sm text-muted-foreground mt-1 flex-1">
        {locked
          ? `Guarde a história do casal depois da noite. A partir de ${monthly}.`
          : isCanceling && nextChargeLabel
            ? `Renovação automática desligada. Acesso até ${nextChargeLabel}${remainingDays != null ? ` (${remainingDays} ${remainingDays === 1 ? "dia" : "dias"})` : ""}.`
            : isLapsed
              ? `Assinatura expirada. Reative por ${monthly}.`
              : nextChargeLabel
                ? `Linha do tempo, galeria, cartas e mapa · próxima cobrança em ${nextChargeLabel}.`
                : `Linha do tempo, galeria, cartas e mapa — ${monthly}.`}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {locked ? (
          <Button asChild className="w-full">
            <Link to="/memory-lane" search={{ upgrade: true }}>
              Adicionar Memory Lane
            </Link>
          </Button>
        ) : isLapsed ? (
          <Button asChild className="w-full">
            <Link to="/memory-lane">Reativar assinatura</Link>
          </Button>
        ) : (
          <>
            <Button asChild className="w-full">
              <Link to="/timeline">
                Abrir linha do tempo <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/gallery">Galeria</Link>
            </Button>
            {isCanceling && (
              <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground">
                <Link to="/settings">Reativar renovação</Link>
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
