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
      <main className="max-w-2xl mx-auto px-4 py-12 space-y-8 text-sm leading-relaxed">
        <div>
          <h1 className="font-display text-3xl">Termos de Uso</h1>
          <p className="text-muted-foreground mt-2">Última atualização: maio de 2026</p>
        </div>

        <Section title="1. Objeto">
          <p>
            Estes Termos regulam o acesso e o uso do <strong>Método Surpresa Perfeita™</strong>, produto
            digital que oferece um gerador de plano de surpresa romântica personalizado por inteligência
            artificial, incluindo conteúdo estático de apoio (decoração, playlists, frases, lista de
            compras).
          </p>
        </Section>

        <Section title="2. Acesso ao produto">
          <p>
            O acesso é concedido individualmente ao comprador após confirmação do pagamento. O acesso é
            pessoal, intransferível e não pode ser compartilhado, revendido ou cedido a terceiros.
          </p>
          <p className="mt-3">
            O plano Básico dá acesso ao gerador com as seções essenciais. O plano Premium desbloqueia
            seções adicionais (frases românticas, ideias de jantar, plano de emergência, checklist e
            download em PDF). O Kit Surpresa Premium adiciona conteúdo estático de bônus.
          </p>
        </Section>

        <Section title="3. Conteúdo gerado por IA">
          <p>
            Os planos são criados por modelo de linguagem (IA) com base nas respostas fornecidas no quiz.
            Os resultados são personalizados porém automáticos — o produto não garante resultado
            emocional específico. A qualidade da execução pelo usuário influencia diretamente a
            experiência final.
          </p>
          <p className="mt-3">
            O usuário pode refazer o quiz quantas vezes desejar; cada conjunto de respostas diferente
            gera um plano novo.
          </p>
        </Section>

        <Section title="4. Garantia e reembolso">
          <p>
            Oferecemos garantia de <strong>7 dias corridos</strong> a partir da data da compra. Nesse
            período, o usuário pode solicitar o reembolso integral sem necessidade de justificativa,
            entrando em contato pelo e-mail de suporte. Após esse prazo, não serão aceitas solicitações
            de devolução.
          </p>
        </Section>

        <Section title="5. Propriedade intelectual">
          <p>
            Todo o conteúdo estático do produto (textos, roteiros, temas de decoração, modelos de
            bilhete) é de propriedade do criador. O plano gerado pela IA, com base nas respostas do
            usuário, pode ser usado livremente para fins pessoais. É proibida a reprodução,
            redistribuição ou revenda do conteúdo do produto.
          </p>
        </Section>

        <Section title="6. Limitação de responsabilidade">
          <p>
            O produto é fornecido "como está". Não nos responsabilizamos por falhas temporárias no
            serviço de IA, por resultados que dependam da execução do usuário, ou por qualquer dano
            indireto decorrente do uso do produto.
          </p>
        </Section>

        <Section title="7. Alterações">
          <p>
            Estes termos podem ser atualizados a qualquer momento. Alterações relevantes serão
            comunicadas na página de vendas. O uso continuado do produto após a atualização implica
            aceitação dos novos termos.
          </p>
        </Section>

        <Section title="8. Contato">
          <p>
            Dúvidas, solicitações de reembolso ou suporte: entre em contato pelo e-mail disponível na
            página de vendas ou pelo WhatsApp informado no checkout.
          </p>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-semibold text-base mb-2">{title}</h2>
      <div className="text-muted-foreground">{children}</div>
    </section>
  );
}
