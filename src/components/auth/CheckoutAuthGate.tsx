import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/workspace-sync";

/** Exige login antes do checkout quando Supabase está configurado. */
export function CheckoutAuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, configured } = useAuth();
  const supabaseReady = isSupabaseConfigured();

  if (!supabaseReady || !configured) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">Verificando sua sessão...</p>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
        <h2 className="font-display text-xl">Entre para finalizar a compra</h2>
        <p className="text-sm text-muted-foreground">
          Sua compra e assinatura ficam vinculadas à sua conta — assim você acessa de qualquer
          dispositivo.
        </p>
        <Button asChild className="w-full">
          <Link to="/auth/login" search={{ redirect: "/surprise" }}>
            Entrar ou criar conta
          </Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
