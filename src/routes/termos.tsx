import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [{ title: "Termos de Uso — Método Surpresa Perfeita™" }],
  }),
  component: TermosPage,
});

function TermosPage() {
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
      <main className="max-w-2xl mx-auto px-4 py-12 prose prose-neutral dark:prose-invert">
        <h1 className="font-display text-3xl">Termos de Uso</h1>
        <p className="text-muted-foreground text-sm mt-2">Última atualização: maio de 2026</p>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          Ao adquirir o Método Surpresa Perfeita™, você concorda em utilizar o conteúdo digital
          exclusivamente para uso pessoal. O acesso é concedido após confirmação do pagamento. Os
          planos são gerados por ferramentas automatizadas com base nas suas respostas ao quiz; os
          resultados podem variar conforme sua execução. Para dúvidas sobre reembolso, consulte a
          garantia de 7 dias informada na página de vendas.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Este documento é um resumo provisório. Termos completos serão publicados antes da
          integração definitiva do checkout.
        </p>
      </main>
    </div>
  );
}
