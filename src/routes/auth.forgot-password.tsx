import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({ email: z.string().email("E-mail inválido") });

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword, configured } = useAuth();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    if (!configured) {
      toast.error("Supabase não configurado.");
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(values.email);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Enviamos um link de recuperação para seu e-mail.");
  }

  return (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos um link para redefinir sua senha.">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar link"}
        </Button>
      </form>
      <p className="text-sm text-center text-muted-foreground mt-6">
        <Link to="/auth/login" className="text-primary hover:underline">
          Voltar ao login
        </Link>
      </p>
    </AuthShell>
  );
}
