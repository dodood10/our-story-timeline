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
import {
  assertRequestedSurpriseTier,
  resolveSurprisePlanAccess,
} from "@/integrations/supabase/surprise-plan-middleware";

const PLAN_SCHEMA_DESCRIPTION =
  "Plano de surpresa romântica em português brasileiro (schema v2). Retorne JSON válido conforme tier.";

function buildPrompt(a: SurpriseAnswers) {
  const likes = a.likes.map((k) => LABELS.likes[k]).join(", ");
  const nameCtx = a.partnerName
    ? `\n- Nome de quem vai receber: ${a.partnerName} (use no título, no mapa da noite e nas frases)`
    : "";
  const isPremium = a.tier === "premium";

  const tierRules = isPremium
    ? `TIER PREMIUM — preencha TUDO:
- budgetPlans: 4–6 itens em cada faixa (upTo50, upTo100, upTo200), adaptados ao local e estilo
- phrasesByMoment: frase autoral específica para cada momento (entrada, mesa, bilhete, whatsapp, encerramento)
- checklist: 14–18 itens práticos para checagem final
- premiumExtras: exatamente 10 decorationThemes; 4 playlists; 3 giftsByBudget; 3 cardTemplates; 3 extraScripts; 4 dinnerIdeas; 5 emergencyPlan`
    : `TIER BÁSICO — preencha resumo, nightMap (5 fases), decoration, shopping (essential+optional, sem tier premium), timeline (6 slots), avoidMistakes (5 itens).
Deixe VAZIOS: budgetPlans (arrays vazios), phrasesByMoment (strings vazias), checklist ([]), premiumExtras (todos arrays vazios).`;

  return `Crie um plano completo de surpresa romântica para o Dia dos Namorados em português brasileiro.
Tom: acolhedor, específico, realista — NUNCA genérico ("velas e flores" sem detalhe).

Contexto do quiz:
- Para quem: ${LABELS.recipient[a.recipient]}${nameCtx}
- Local: ${LABELS.place[a.place]}
- Orçamento escolhido: ${LABELS.budget[a.budget]}
- Estilo: ${LABELS.style[a.style]}
- Tempo de montagem: ${LABELS.time[a.time]}
- O casal gosta de: ${likes}

${tierRules}

Estrutura obrigatória:
1. title: 5–8 palavras, cativante, com nome se informado
2. concept: 2–3 frases emocionais na 2ª pessoa ("você")
3. summary: difficulty (facil|medio|caprichado), nightMood (ex: "Íntimo e elegante"), estimatedBudget (faixa em R$)
4. nightMap: EXATAMENTE 5 itens, phases nesta ordem: entrada, ambiente, emocional, jantar, encerramento — cada um com title, description, microTip
5. decoration: byEnvironment (2–3 zonas ligadas ao local), lighting, tableOrBed, photosAndNotes, scentAndMusic, sensoryDetails (4–6 itens sensoriais específicos)
6. shopping.items: 8–14 itens com name, quantity (ex: "6 un"), priceEstimate (ex: "R$12–18"), whereToBuy (mercado|papelaria|festa|variedades|online), tier (essential|optional|premium)
7. timeline: EXATAMENTE 6 itens, slots nesta ordem: 2h, 1h30, 1h, 30min, 10min, chegada — tasks concretas
8. avoidMistakes: 5–8 erros comuns específicos ao local e estilo escolhidos

Regras anti-genérico:
- Cite o local (${LABELS.place[a.place]}) e pelo menos 2 gostos (${likes}) no mapa da noite e na decoração
- Preços realistas Brasil 2026; essential deve caber no orçamento ${LABELS.budget[a.budget]}
- Proibido clichê vazio; cada item de compra deve ser acionável`;
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
    prompt: `Converta a resposta abaixo em JSON válido que siga exatamente o schema v2 do plano. Não invente chaves extras.\n\n${text}`,
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
  if (status === 402)
    return new Error("Limite de geração atingido. Adicione créditos no workspace.");
  if (status === 401 || status === 403)
    return new Error("Gerador temporariamente indisponível. Tente mais tarde.");
  const msg = e?.message
    ? `Falha ao gerar o plano: ${e.message}`
    : "Falha ao gerar o plano. Tente novamente.";
  return new Error(msg);
}

export const generateSurprisePlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SurpriseAnswersSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurado");

    const surpriseTier = await resolveSurprisePlanAccess();
    if (surpriseTier) {
      assertRequestedSurpriseTier(surpriseTier, data.tier);
    }

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
