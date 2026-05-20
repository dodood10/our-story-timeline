import { Link } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, configured } = useAuth();
  const isAdmin = useIsAdmin();

  if (!configured) {
    return (
      <DeniedScreen
        title="Supabase não configurado"
        description="O painel admin requer Supabase Auth."
      />
    );
  }

  if (loading) {
    return (
      <DeniedScreen title="Carregando…" description="">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mt-4" />
      </DeniedScreen>
    );
  }

  if (!isAuthenticated) {
    return (
      <DeniedScreen title="Login necessário" description="Entre com uma conta administrador.">
        <Button asChild className="mt-6">
          <Link to="/auth/login" search={{ redirect: "/admin" }}>
            Entrar
          </Link>
        </Button>
      </DeniedScreen>
    );
  }

  if (!isAdmin) {
    return (
      <DeniedScreen
        title="Acesso negado"
        description="Sua conta não tem permissão de administrador."
      >
        <Button asChild variant="outline" className="mt-6">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </DeniedScreen>
    );
  }

  return <>{children}</>;
}

function DeniedScreen({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-card text-center">
        <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
        <h1 className="font-display text-2xl mt-4">{title}</h1>
        {description ? <p className="text-muted-foreground mt-2 text-sm">{description}</p> : null}
        {children}
      </div>
    </div>
  );
}
