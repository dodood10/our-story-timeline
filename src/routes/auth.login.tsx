import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailPasswordForm, type EmailPasswordValues } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { syncEntitlementsAfterAuth } from "@/lib/entitlements.functions";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: (s) => searchSchema.parse(s),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, configured } = useAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth/login" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: EmailPasswordValues) {
    if (!configured) {
      toast.error("Supabase não configurado.");
      return;
    }
    setLoading(true);
    const { error } = await signIn(values.email, values.password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      await syncEntitlementsAfterAuth({ data: { email: values.email } });
    } catch {
      /* entitlements sync opcional */
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: redirect || "/app", replace: true });
  }

  return (
    <AuthShell title="Entrar" subtitle="Acesse sua conta para continuar no Memory Lane.">
      <EmailPasswordForm submitLabel="Entrar" loading={loading} onSubmit={onSubmit} />
      <p className="text-sm text-center text-muted-foreground mt-6">
        <Link to="/auth/forgot-password" className="text-primary hover:underline">
          Esqueci minha senha
        </Link>
        {" · "}
        <Link to="/auth/recover-access" className="text-primary hover:underline">
          Recuperar acesso da compra
        </Link>
      </p>
      <p className="text-sm text-center text-muted-foreground mt-2">
        Não tem conta?{" "}
        <Link
          to="/auth/signup"
          search={redirect ? { redirect } : undefined}
          className="text-primary font-medium hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
