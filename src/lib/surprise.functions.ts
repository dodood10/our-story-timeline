import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { generateObject, generateText, Output } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway";
import {
  SurpriseAnswersSchema,
  SurprisePlanSchema,
  LABELS,
  type SurpriseAnswers,
  type SurprisePlan,
} from "./surprise-types";
import { checkSurpriseRateLimit, clientKeyFromRequest } from "./surprise-rate-limit";

const PLAN_SCHEMA_DESCRIPTION =
  "Plano de surpresa romântica em português brasileiro. Retorne somente campos do schema, com arrays preenchidos conforme o tier.";

function buildPrompt(a: SurpriseAnswers) {
  const likes = a.likes.map((k) => LABELS.likes[k]).join(", ");
  const nameCtx = a.partnerName
    ? `\n- Nome de quem vai receber: ${a.partnerName} (use o nome no título e em pelo menos 2 frases românticas)`
    : "";
  return `Crie um plano completo de surpresa romântica para o Dia dos Namorados em português brasileiro, com tom acolhedor, criativo e realista (sem clichês). Considere:

- Para quem: ${LABELS.recipient[a.recipient]}${nameCtx}
- Local: ${LABELS.place[a.place]}
- Orçamento: ${LABELS.budget[a.budget]}
- Estilo desejado: ${LABELS.style[a.style]}
- Tempo disponível: ${LABELS.time[a.time]}
- O casal gosta de: ${likes}
- Tier do plano: ${a.tier === "premium" ? "PREMIUM (preencher todas as seções extras)" : "BÁSICO (deixar romanticPhrases, dinnerIdeas, emergencyPlan e checklist como arrays vazios)"}

Regras importantes:
- A lista de compras essential deve caber no orçamento informado (preços do Brasil em 2026). Para cada item da lista essential e optional, adicione uma estimativa de preço entre parênteses — ex: "Velas aromáticas (R$20–30)".
- O passo a passo (timeline) deve ter entre 4 e 7 itens com horários relativos ("60 min antes", "30 min antes", etc).
- Frases românticas: 6 frases curtas, autorais, sem clichê. Não cite "te amo" mais de uma vez.
- Plano emergência: como montar uma surpresa decente em até 1 hora.
- Tudo escrito direto para o usuário, na 2ª pessoa do singular ("você").
- O título deve ser cativante (5-8 palavras).`;
}

function extractJsonObject(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  const source = fenced ?? text;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return source.slice(start, end + 1);
}

async function repairPlanJson({ text }: { text: string }): Promise<string | null> {
  const extracted = extractJsonObject(text);
  if (extracted) return extracted;

  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;

  const gateway = createLovableAiGatewayProvider(key);
  const model = gateway("google/gemini-3-flash-preview");
  const result = await generateText({
    model,
    output: Output.object({
      schema: SurprisePlanSchema,
      name: "surprise_plan",
      description: PLAN_SCHEMA_DESCRIPTION,
    }),
    prompt: `Converta a resposta abaixo em um JSON válido que siga exatamente o schema do plano de surpresa. Não invente chaves extras.\n\n${text}`,
  });

  return JSON.stringify(result.output satisfies SurprisePlan);
}

function mapAiError(err: unknown): Error {
  const e = err as {
    statusCode?: number;
    status?: number;
    message?: string;
    name?: string;
    cause?: unknown;
  };
  console.error("[generateSurprisePlan] AI error:", {
    name: e?.name,
    status: e?.statusCode ?? e?.status,
    message: e?.message,
    cause: e?.cause,
  });
  const status = e?.statusCode ?? e?.status;
  if (status === 429) return new Error("Muitas requisições. Tente novamente em alguns segundos.");
  if (status === 402) return new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
  if (status === 401 || status === 403)
    return new Error("Serviço de IA indisponível. Tente mais tarde.");
  const msg = e?.message ? `Falha ao gerar o plano: ${e.message}` : "Falha ao gerar o plano. Tente novamente.";
  return new Error(msg);
}

export const generateSurprisePlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SurpriseAnswersSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurado");

    const request = getRequest();
    checkSurpriseRateLimit(clientKeyFromRequest(request));

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    try {
      const { object } = await generateObject({
        model,
        schema: SurprisePlanSchema,
        schemaName: "surprise_plan",
        schemaDescription: PLAN_SCHEMA_DESCRIPTION,
        experimental_repairText: repairPlanJson,
        prompt: buildPrompt(data),
      });
      return object;
    } catch (err: unknown) {
      throw mapAiError(err);
    }
  });
