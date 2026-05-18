import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dev-unlock")({
  head: () => ({ meta: [{ title: "Dev Unlock" }] }),
  component: DevUnlock,
});

function DevUnlock() {
  const { surprise, setSurprise, full, setFull, reset } = useAccess();

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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-card space-y-6">
        <div>
          <h1 className="font-display text-2xl">Acesso de teste</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Simula compras enquanto não temos checkout real. Estado salvo em localStorage.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Surpresa: <span className="text-primary">{surprise}</span></p>
          <div className="grid grid-cols-3 gap-2">
            <Button size="sm" variant={surprise === "none" ? "default" : "outline"} onClick={() => setSurprise("none")}>Nenhum</Button>
            <Button size="sm" variant={surprise === "basic" ? "default" : "outline"} onClick={() => setSurprise("basic")}>Básico</Button>
            <Button size="sm" variant={surprise === "premium" ? "default" : "outline"} onClick={() => setSurprise("premium")}>Premium</Button>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">App Memory Lane: <span className="text-primary">{full ? "desbloqueado" : "bloqueado"}</span></p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant={!full ? "default" : "outline"} onClick={() => setFull(false)}>Bloquear</Button>
            <Button size="sm" variant={full ? "default" : "outline"} onClick={() => setFull(true)}>Desbloquear</Button>
          </div>
        </div>

        <Button variant="ghost" className="w-full" onClick={reset}>Resetar tudo</Button>

        <div className="flex gap-2 pt-2 border-t border-border">
          <Button asChild variant="link" size="sm"><Link to="/">/</Link></Button>
          <Button asChild variant="link" size="sm"><Link to="/surprise">/surprise</Link></Button>
          <Button asChild variant="link" size="sm"><Link to="/app">/app</Link></Button>
        </div>
      </div>
    </div>
  );
}
