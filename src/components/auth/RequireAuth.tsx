import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/** Redireciona para login ou mostra loading enquanto a sessão hidrata. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, configured } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-muted-foreground">
            Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.
          </p>
          <Button asChild variant="outline">
            <Link to="/">Voltar</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Heart className="h-10 w-10 text-primary animate-float-heart" />
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-soft">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-card text-center">
          <h1 className="font-display text-2xl">Entre na sua conta</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Faça login para acessar o Memory Lane e sincronizar seus dados.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/auth/login" search={{ redirect: pathname }}>
                Entrar
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth/signup" search={{ redirect: pathname }}>
                Criar conta
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
