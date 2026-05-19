import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccess, type ProductMode } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";

const MODES: { mode: ProductMode; label: string }[] = [
  { mode: "none", label: "Nenhum" },
  { mode: "surprise_only", label: "Só Surpresa" },
  { mode: "memory_lane_only", label: "Só Memory Lane" },
  { mode: "both", label: "Ambos" },
];

export const Route = createFileRoute("/dev-unlock")({
  head: () => ({ meta: [{ title: "Dev Unlock" }] }),
  component: DevUnlock,
});

function DevUnlock() {
  const {
    surprise,
    subscription,
    subscriptionState,
    productMode,
    setProductMode,
    cancelMemoryLane,
    reactivateMemoryLane,
    renewMemoryLaneNow,
    expireMemoryLaneNow,
    reset,
  } = useAccess();

  if (!import.meta.env.DEV) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl">404</h1>
          <p className="text-muted-foreground mt-2">Página não encontrada.</p>
          <Button asChild className="mt-6">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const periodEnd = subscription
    ? new Date(subscription.currentPeriodEnd).toLocaleString("pt-BR")
    : "—";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-card space-y-6">
        <div>
          <h1 className="font-display text-2xl">Acesso de teste</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Simula compras. Modo atual: <strong className="text-primary">{productMode}</strong>
          </p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">
            Surpresa: <span className="text-primary">{surprise}</span> · ML:{" "}
            <span className="text-primary">{subscriptionState}</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map(({ mode, label }) => (
              <Button
                key={mode}
                size="sm"
                variant={productMode === mode ? "default" : "outline"}
                onClick={() => setProductMode(mode)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-border p-3 bg-background/50">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Assinatura Memory Lane
          </p>
          <p className="text-xs text-muted-foreground">
            Período corrente termina em <strong className="text-foreground">{periodEnd}</strong>
            {subscription && (
              <>
                {" "}
                · renovações: {subscription.renewals} · autoRenew:{" "}
                {subscription.autoRenew ? "sim" : "não"}
              </>
            )}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={renewMemoryLaneNow}>
              Renovar +30d
            </Button>
            <Button size="sm" variant="outline" onClick={expireMemoryLaneNow}>
              Expirar agora
            </Button>
            <Button size="sm" variant="outline" onClick={cancelMemoryLane}>
              Cancelar
            </Button>
            <Button size="sm" variant="outline" onClick={reactivateMemoryLane}>
              Reativar
            </Button>
          </div>
        </div>

        <Button variant="ghost" className="w-full" onClick={reset}>
          Resetar tudo
        </Button>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Button asChild variant="link" size="sm">
            <Link to="/">/</Link>
          </Button>
          <Button asChild variant="link" size="sm">
            <Link to="/app">/app</Link>
          </Button>
          <Button asChild variant="link" size="sm">
            <Link to="/surprise">/surprise</Link>
          </Button>
          <Button asChild variant="link" size="sm">
            <Link to="/memory-lane">/memory-lane</Link>
          </Button>
          <Button asChild variant="link" size="sm">
            <Link to="/settings">/settings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
