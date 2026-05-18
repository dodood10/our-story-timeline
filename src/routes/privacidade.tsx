import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [{ title: "Política de Privacidade — Método Surpresa Perfeita™" }],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Heart className="h-4 w-4 text-primary" /> Voltar
        </Link>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-display text-3xl">Política de Privacidade</h1>
        <p className="text-muted-foreground text-sm mt-2">Última atualização: maio de 2026</p>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          Coletamos dados informados no checkout (nome, e-mail, WhatsApp) para liberar seu acesso e
          enviar comunicações relacionadas ao produto. Respostas do quiz e planos gerados podem ser
          armazenados localmente no seu dispositivo e, se você ativar a sincronização, em nossa base
          de dados conforme as configurações do app.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Não vendemos seus dados a terceiros. Esta política será atualizada quando o checkout e os
          provedores de pagamento forem integrados de forma definitiva.
        </p>
      </main>
    </div>
  );
}
