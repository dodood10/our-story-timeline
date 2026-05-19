import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart,
  Sparkles,
  CalendarHeart,
  Plus,
  Mail,
  ArrowRight,
  Image as ImageIcon,
  Lock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAccess } from "@/hooks/useAccess";
import { useApp } from "@/hooks/useApp";
import { ProductHub } from "@/components/hub/ProductHub";
import { OnThisDay } from "@/components/home/OnThisDay";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/common/Photo";
import { upcomingMilestones, formatShortPT, daysTogether } from "@/lib/dates";
import { readCachedPlan } from "@/lib/surprise-cache";
import { daysUntil, formatNextChargeDate } from "@/lib/memory-lane-subscription";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Minha área — Seus produtos" },
      { name: "description", content: "Surpresa romântica e Memory Lane em um só lugar." },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const {
    hydrated: accessHydrated,
    canUseMemoryLane,
    canUseSurprise,
    productMode,
    subscription,
    subscriptionState,
  } = useAccess();
  const { hydrated: appHydrated, couple, memories } = useApp();

  const milestones = useMemo(() => {
    if (!canUseMemoryLane || !couple) return [];
    return upcomingMilestones(couple.startDate);
  }, [canUseMemoryLane, couple]);

  const recentMemories = useMemo(() => {
    if (!canUseMemoryLane) return [];
    return [...memories].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 3);
  }, [canUseMemoryLane, memories]);

  const cachedPlan = useMemo(() => {
    if (!canUseSurprise) return null;
    return readCachedPlan("premium") ?? readCachedPlan("basic");
  }, [canUseSurprise]);

  if (!accessHydrated || !appHydrated) {
    return (
      <div className="py-16 flex items-center justify-center">
        <Heart className="h-10 w-10 text-primary animate-float-heart" />
      </div>
    );
  }

  const greetingTitle = couple ? `Olá, ${couple.name1} e ${couple.name2}` : "Bem-vindo à sua área";
  const togetherDays = couple ? daysTogether(couple.startDate) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Minha área</p>
        <h1 className="font-display text-3xl sm:text-4xl">{greetingTitle}</h1>
        {couple && canUseMemoryLane && (
          <p className="text-sm text-muted-foreground">
            Vocês estão juntos há{" "}
            <span className="font-medium text-foreground">{togetherDays}</span> dias 💕
          </p>
        )}
        {!couple && canUseMemoryLane && (
          <p className="text-sm text-muted-foreground">
            Cadastre o casal no onboarding para liberar a linha do tempo personalizada.
          </p>
        )}
      </header>

      {subscriptionState === "lapsed" && (
        <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="font-display text-lg text-destructive">Assinatura vencida</h2>
              <p className="text-sm text-foreground/80">
                Seu acesso ao Memory Lane expirou. Suas memórias seguem salvas neste dispositivo —
                reative por R$ 29,90/mês para voltar a abrir a linha do tempo, galeria e cartas.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild>
                  <Link to="/memory-lane">Reativar agora</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/settings">Gerenciar assinatura</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {subscriptionState === "canceling" && subscription && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
              <RefreshCw className="h-5 w-5 text-amber-700 dark:text-amber-300" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="font-display text-lg">Renovação automática desligada</h2>
              <p className="text-sm text-muted-foreground">
                Você cancelou a assinatura. O acesso fica liberado até{" "}
                <strong className="text-foreground">{formatNextChargeDate(subscription)}</strong> (
                {daysUntil(subscription.currentPeriodEnd)}{" "}
                {daysUntil(subscription.currentPeriodEnd) === 1 ? "dia" : "dias"} restantes). Quer
                voltar a renovar?
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild variant="outline">
                  <Link to="/settings">Reativar renovação</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {canUseMemoryLane && couple && milestones.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <CalendarHeart className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg">Próximas datas</h2>
            </div>
            <Link
              to="/stats"
              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              Ver tudo <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {milestones.slice(0, 4).map((m) => (
              <li
                key={m.label + m.daysLeft}
                className="flex items-center justify-between rounded-xl bg-background/60 border border-border/60 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{formatShortPT(m.date)}</p>
                </div>
                <span className="text-xs text-primary font-medium shrink-0">
                  {m.daysLeft} {m.daysLeft === 1 ? "dia" : "dias"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {canUseMemoryLane && <OnThisDay />}

      {canUseMemoryLane && recentMemories.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg">Memórias recentes</h2>
            <Link
              to="/timeline"
              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              Linha do tempo <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {recentMemories.map((m) => (
              <li
                key={m.id}
                className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-primary/5 flex items-center justify-center overflow-hidden">
                  {m.photos[0] ? (
                    <Photo src={m.photos[0]} alt={m.title} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-primary/40" />
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-sm font-medium line-clamp-1">{m.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatShortPT(m.date)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {canUseMemoryLane && recentMemories.length === 0 && couple && (
        <section className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
          <Heart className="h-8 w-8 text-primary/60 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Ainda não há memórias registradas. Comece pela primeira.
          </p>
          <Button asChild className="mt-3">
            <Link to="/timeline">
              <Plus className="h-4 w-4 mr-1" /> Nova memória
            </Link>
          </Button>
        </section>
      )}

      {canUseSurprise && (
        <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-card p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg">Surpresa romântica</h2>
              {cachedPlan ? (
                <>
                  <p className="text-sm text-muted-foreground mt-1">
                    Seu último plano:{" "}
                    <span className="text-foreground font-medium">{cachedPlan.title}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild>
                      <Link to="/surprise/plan">Abrir meu plano</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/surprise/quiz">Refazer quiz</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mt-1">
                    Responda o quiz e a IA gera um plano com decoração, compras, cronograma e
                    frases.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild>
                      <Link to="/surprise/quiz">
                        Começar quiz <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {productMode === "surprise_only" && (
        <section className="rounded-2xl border border-dashed border-border bg-card/50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg">Memory Lane</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Linha do tempo, galeria, cartas, mapa e conquistas — o diário de vocês.
              </p>
              <Button asChild className="mt-3">
                <Link to="/memory-lane" search={{ upgrade: true }}>
                  Adicionar Memory Lane
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-lg">Seus produtos</h2>
        <ProductHub variant="compact" />
      </section>

      {canUseMemoryLane && (
        <section className="flex flex-wrap gap-2 pt-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/timeline">
              <Plus className="h-4 w-4 mr-1" /> Nova memória
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/letters">
              <Mail className="h-4 w-4 mr-1" /> Nova carta
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/gallery">Galeria</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
