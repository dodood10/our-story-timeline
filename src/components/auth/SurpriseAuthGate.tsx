import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/workspace-sync";
import { Loader2 } from "lucide-react";

/** Exige login para quiz/plano quando Supabase está configurado. */
export function SurpriseAuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, configured } = useAuth();
  const supabaseReady = isSupabaseConfigured();

  if (!supabaseReady || !configured) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando sua sessão...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4 max-w-md mx-auto">
        <h2 className="font-display text-xl">Entre na sua conta</h2>
        <p className="text-sm text-muted-foreground">
          Use o mesmo e-mail da compra para acessar o quiz e o plano personalizado em qualquer
          dispositivo.
        </p>
        <Button asChild className="w-full">
          <Link to="/auth/login" search={{ redirect: "/surprise/quiz" }}>
            Entrar
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to="/auth/recover-access" preload={false}>
            Recuperar acesso
          </Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
