import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway";
import { SurpriseAnswersSchema, SurprisePlanSchema, LABELS, type SurpriseAnswers } from "./surprise-types";

function buildPrompt(a: SurpriseAnswers) {
  const likes = a.likes.map((k) => LABELS.likes[k]).join(", ");
  return `Crie um plano completo de surpresa romântica para o Dia dos Namorados em português brasileiro, com tom acolhedor, criativo e realista (sem clichês). Considere:

- Para quem: ${LABELS.recipient[a.recipient]}
- Local: ${LABELS.place[a.place]}
- Orçamento: ${LABELS.budget[a.budget]}
- Estilo desejado: ${LABELS.style[a.style]}
- Tempo disponível: ${LABELS.time[a.time]}
- O casal gosta de: ${likes}
- Tier do plano: ${a.tier === "premium" ? "PREMIUM (preencher todas as seções extras)" : "BÁSICO (deixar romanticPhrases, dinnerIdeas, emergencyPlan e checklist como arrays vazios)"}

Regras importantes:
- A lista de compras essential deve caber no orçamento informado (preços do Brasil em 2026).
- O passo a passo (timeline) deve ter entre 4 e 7 itens com horários relativos ("60 min antes", "30 min antes", etc).
- Frases românticas: 6 frases curtas, autorais, sem clichê. Não cite "te amo" mais de uma vez.
- Plano emergência: como montar uma surpresa decente em até 1 hora.
- Tudo escrito direto para o usuário, na 2ª pessoa do singular ("você").
- O título deve ser cativante (5-8 palavras).`;
}

export const generateSurprisePlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SurpriseAnswersSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurado");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    try {
      const { object } = await generateObject({
        model,
        schema: SurprisePlanSchema,
        prompt: buildPrompt(data),
      });
      return object;
    } catch (err: unknown) {
      const e = err as { statusCode?: number; status?: number; message?: string };
      const status = e?.statusCode ?? e?.status;
      if (status === 429) throw new Error("Muitas requisições. Tente novamente em alguns segundos.");
      if (status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
      throw new Error(e?.message ?? "Falha ao gerar o plano. Tente novamente.");
    }
  });
