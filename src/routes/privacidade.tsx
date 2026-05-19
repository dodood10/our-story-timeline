import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [{ title: `Política de Privacidade — ${BRAND_NAME}` }],
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
      <main className="max-w-2xl mx-auto px-4 py-12 space-y-8 text-sm leading-relaxed">
        <div>
          <h1 className="font-display text-3xl">Política de Privacidade</h1>
          <p className="text-muted-foreground mt-2">Última atualização: maio de 2026</p>
        </div>

        <Section title="1. Dados coletados">
          <p>Coletamos apenas os dados que você fornece voluntariamente:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>
              <strong>Checkout:</strong> nome completo, e-mail e WhatsApp (obrigatórios); CPF
              (apenas para pagamento com cartão).
            </li>
            <li>
              <strong>Quiz:</strong> respostas sobre preferências do casal (armazenadas localmente
              no seu navegador).
            </li>
            <li>
              <strong>Conta:</strong> e-mail e senha (Supabase Auth) para vincular compra e sync.
            </li>
            <li>
              <strong>Sincronização opcional:</strong> backup do casal na nuvem (workspace vinculado
              à conta).
            </li>
          </ul>
          <p className="mt-3">
            Pagamentos são processados pelo <strong>Mercado Pago</strong> (não armazenamos dados de
            cartão). Podemos usar <strong>Meta Pixel</strong> na landing para métricas de campanha.
            Provedores: Supabase (dados de conta/sync), provedor de geração do plano (Lovable
            Gateway).
          </p>
        </Section>

        <Section title="2. Como usamos seus dados">
          <ul className="space-y-1 list-disc list-inside">
            <li>Liberar e confirmar o acesso ao produto comprado.</li>
            <li>Enviar confirmação de compra e, se necessário, comunicações sobre o produto.</li>
            <li>Personalizar o plano com base nas respostas do quiz.</li>
          </ul>
          <p className="mt-3">
            Não usamos seus dados para publicidade de terceiros ou criação de perfis
            comportamentais.
          </p>
        </Section>

        <Section title="3. Compartilhamento de dados">
          <p>
            Seus dados <strong>não são vendidos</strong> a terceiros. Podemos compartilhá-los
            somente com:
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>
              Provedores de pagamento (Mercado Pago, Stripe ou equivalente), para processamento da
              transação.
            </li>
            <li>Provedores de e-mail, para envio de confirmações de acesso.</li>
            <li>
              Serviço de banco de dados em nuvem (Supabase), quando a sincronização opcional estiver
              ativa.
            </li>
          </ul>
          <p className="mt-3">
            Todos os provedores são contratados com obrigações de confidencialidade.
          </p>
        </Section>

        <Section title="4. Armazenamento e retenção">
          <p>
            Os dados do checkout ficam armazenados pelo período necessário para suporte, reembolsos
            e obrigações fiscais (mínimo de 5 anos, conforme legislação brasileira). Após
            solicitação de exclusão, os dados são removidos em até 30 dias úteis, exceto quando a
            retenção for legalmente obrigatória.
          </p>
          <p className="mt-3">
            As respostas do quiz e o plano gerado ficam armazenados{" "}
            <strong>somente no seu dispositivo</strong> (localStorage do navegador), a menos que
            você ative a sincronização.
          </p>
        </Section>

        <Section title="5. Seus direitos (LGPD)">
          <p>Nos termos da Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Confirmar a existência de tratamento dos seus dados.</li>
            <li>Acessar os dados que temos sobre você.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a exclusão dos seus dados.</li>
            <li>Revogar o consentimento a qualquer momento.</li>
          </ul>
          <p className="mt-3">
            Para exercer qualquer desses direitos, entre em contato pelo e-mail informado na página
            de vendas.
          </p>
        </Section>

        <Section title="6. Segurança">
          <p>
            Adotamos medidas técnicas razoáveis para proteger seus dados contra acesso não
            autorizado, incluindo transmissão via HTTPS e acesso restrito ao banco de dados. Nenhum
            sistema é 100% seguro; em caso de incidente que afete seus dados, você será notificado
            conforme exigido pela LGPD.
          </p>
        </Section>

        <Section title="7. Contato">
          <p>
            Dúvidas sobre esta política ou solicitações relacionadas aos seus dados: entre em
            contato pelo e-mail disponível na página de vendas.
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
