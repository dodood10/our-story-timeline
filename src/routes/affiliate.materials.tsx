import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/affiliate/materials")({
  component: AffiliateMaterialsPage,
});

function AffiliateMaterialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Materiais</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Textos prontos para redes sociais e mensagens diretas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Story / Reels</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-foreground">
          <p>
            Quer surpreender no Dia dos Namorados sem passar horas planejando? Use meu link — quiz
            rápido + plano completo (roteiro, decoração, lista de compras e frases prontas). Acesso
            na hora.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-foreground">
          <p>
            Indico um presente diferente: um plano personalizado para a noite dos namorados. Você
            responde um quiz e recebe tudo mastigado. Vale muito a pena — link abaixo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dicas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
            <li>Use sempre o link da aba &quot;Meu link&quot; (com seu código).</li>
            <li>
              Último clique conta: se alguém clicar outro link antes de comprar, a venda vai para
              outro afiliado.
            </li>
            <li>
              Comissão aparece como pendente por 7 dias e depois é aprovada para pagamento manual
              via Pix.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
