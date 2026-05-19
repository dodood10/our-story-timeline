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

export const Route = createFileRoute("/auth/signup")({
  validateSearch: (s) => searchSchema.parse(s),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth/signup" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: EmailPasswordValues) {
    if (!configured) {
      toast.error("Supabase não configurado.");
      return;
    }
    setLoading(true);
    const { error, needsConfirmation } = await signUp(values.email, values.password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (needsConfirmation) {
      toast.success("Verifique seu e-mail para confirmar o cadastro.");
      navigate({ to: "/auth/login", search: redirect ? { redirect } : undefined });
      return;
    }
    try {
      await syncEntitlementsAfterAuth({ data: { email: values.email } });
    } catch {
      /* opcional */
    }
    toast.success("Conta criada!");
    navigate({ to: redirect || "/app", replace: true });
  }

  return (
    <AuthShell title="Criar conta" subtitle="Guarde a história de vocês com login seguro.">
      <EmailPasswordForm submitLabel="Criar conta" loading={loading} onSubmit={onSubmit} />
      <p className="text-sm text-center text-muted-foreground mt-6">
        Já tem conta?{" "}
        <Link
          to="/auth/login"
          search={redirect ? { redirect } : undefined}
          className="text-primary font-medium hover:underline"
        >
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
