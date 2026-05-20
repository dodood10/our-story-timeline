import { Link } from "@tanstack/react-router";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsAffiliate } from "@/hooks/useIsAffiliate";

export function RequireAffiliate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, configured } = useAuth();
  const { isAffiliate, checking } = useIsAffiliate();

  if (!configured) {
    return (
      <DeniedScreen
        title="Supabase não configurado"
        description="O portal de afiliados requer Supabase Auth."
      />
    );
  }

  if (loading || checking) {
    return (
      <DeniedScreen title="Carregando…" description="">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mt-4" />
      </DeniedScreen>
    );
  }

  if (!isAuthenticated) {
    return (
      <DeniedScreen
        title="Login necessário"
        description="Entre com o e-mail cadastrado no programa de afiliados."
      >
        <Button asChild className="mt-6">
          <Link to="/auth/login" search={{ redirect: "/affiliate" }}>
            Entrar
          </Link>
        </Button>
      </DeniedScreen>
    );
  }

  if (!isAffiliate) {
    return (
      <DeniedScreen
        title="Conta de afiliado não encontrada"
        description="Peça ao administrador para ativar seu cadastro e vincular sua conta ao mesmo e-mail do login."
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
        <Users className="h-10 w-10 text-primary mx-auto" />
        <h1 className="font-display text-2xl mt-4">{title}</h1>
        {description ? <p className="text-muted-foreground mt-2 text-sm">{description}</p> : null}
        {children}
      </div>
    </div>
  );
}
