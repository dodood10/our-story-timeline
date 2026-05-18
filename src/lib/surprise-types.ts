import { z } from "zod";

export const SurpriseAnswersSchema = z.object({
  recipient: z.enum(["namorada", "namorado", "esposa", "marido", "ficante", "noivo_noiva"]),
  place: z.enum(["quarto", "sala", "mesa", "varanda", "hotel", "casa_inteira"]),
  budget: z.enum(["50", "100", "200", "caprichar"]),
  style: z.enum(["fofo", "elegante", "sensual", "simples", "pinterest", "pedido"]),
  time: z.enum(["30min", "1h", "2h", "dia_todo", "antecedencia"]),
  likes: z.array(
    z.enum(["filme", "jantar", "musica", "fotos", "cartas", "vinho", "doces", "massagem", "surpresa_quarto"]),
  ).min(1),
  tier: z.enum(["basic", "premium"]).default("basic"),
});

export type SurpriseAnswers = z.infer<typeof SurpriseAnswersSchema>;

/** Plan generation tier — subset of SurpriseTier that excludes "none". */
export type PlanTier = SurpriseAnswers["tier"];

export const SurprisePlanSchema = z.object({
  title: z.string(),
  concept: z.string(),
  decoration: z.object({
    setup: z.array(z.string()),
    lighting: z.string(),
    photos: z.string(),
    avoid: z.array(z.string()),
  }),
  shopping: z.object({
    essential: z.array(z.string()),
    optional: z.array(z.string()),
  }),
  timeline: z.array(z.object({ time: z.string(), task: z.string() })),
  nightScript: z.array(z.string()),
  romanticPhrases: z.array(z.string()).default([]),
  dinnerIdeas: z.array(z.string()).default([]),
  emergencyPlan: z.array(z.string()).default([]),
  checklist: z.array(z.string()).default([]),
});

export type SurprisePlan = z.infer<typeof SurprisePlanSchema>;

export const LABELS = {
  recipient: {
    namorada: "Namorada", namorado: "Namorado", esposa: "Esposa", marido: "Marido", ficante: "Ficante", noivo_noiva: "Noivo(a)",
  },
  place: {
    quarto: "Quarto", sala: "Sala", mesa: "Mesa de jantar", varanda: "Varanda", hotel: "Hotel/Airbnb", casa_inteira: "Casa inteira",
  },
  budget: {
    "50": "Até R$50", "100": "Até R$100", "200": "Até R$200", caprichar: "Quero caprichar",
  },
  style: {
    fofo: "Fofo e romântico", elegante: "Elegante", sensual: "Sensual/intimista", simples: "Simples e bonito", pinterest: "Estilo Pinterest", pedido: "Pedido especial",
  },
  time: {
    "30min": "30 minutos", "1h": "1 hora", "2h": "2 horas", dia_todo: "Tenho o dia todo", antecedencia: "Vou preparar com antecedência",
  },
  likes: {
    filme: "Filme", jantar: "Jantar", musica: "Música", fotos: "Fotos", cartas: "Cartas", vinho: "Vinho", doces: "Doces", massagem: "Massagem", surpresa_quarto: "Surpresa no quarto",
  },
} as const;
