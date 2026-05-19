import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { syncEntitlementsAfterAuth } from "@/lib/entitlements.functions";
import { isSupabaseConfigured } from "@/lib/workspace-sync";

export const Route = createFileRoute("/auth/recover-access")({
  head: () => ({ meta: [{ title: "Recuperar acesso" }] }),
  component: RecoverAccessPage,
});

function RecoverAccessPage() {
  const { signIn, configured, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      toast.error("Serviço indisponível. Configure o Supabase.");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    if (error) {
      setLoading(false);
      toast.error(error);
      return;
    }
    try {
      await syncEntitlementsAfterAuth({ data: { email: email.trim() } });
      toast.success("Acesso sincronizado! Redirecionando…");
      window.location.href = "/surprise/quiz";
    } catch {
      toast.error(
        "Login ok, mas não foi possível sincronizar a compra. Tente o mesmo e-mail do checkout.",
      );
    }
    setLoading(false);
  }

  return (
    <AuthShell
      title="Recuperar acesso"
      subtitle="Entre com o mesmo e-mail usado no pagamento (Pix ou cartão)."
    >
      {!supabaseReady ? (
        <p className="text-sm text-muted-foreground">
          Recuperação na nuvem indisponível neste ambiente. Em produção, use a conta criada no
          checkout.
        </p>
      ) : isAuthenticated ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">Você já está logado.</p>
          <Button asChild className="w-full">
            <Link to="/surprise/quiz">Ir para o quiz</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/app">Minha área</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recover-email">E-mail da compra</Label>
            <Input
              id="recover-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recover-password">Senha</Label>
            <Input
              id="recover-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando…" : "Recuperar meu acesso"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Ainda não tem conta?{" "}
            <Link
              to="/auth/signup"
              search={{ redirect: "/surprise/quiz" }}
              className="text-primary"
            >
              Criar conta
            </Link>{" "}
            com o mesmo e-mail do checkout.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
