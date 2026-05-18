import { z } from "zod";

export const SurpriseAnswersSchema = z.object({
  recipient: z.enum(["namorada", "namorado", "esposa", "marido", "ficante", "noivo_noiva"]),
  partnerName: z.string().optional(),
  place: z.enum(["quarto", "sala", "mesa", "varanda", "hotel", "casa_inteira"]),
  budget: z.enum(["50", "100", "200", "caprichar"]),
  style: z.enum(["fofo", "elegante", "sensual", "simples", "pinterest", "pedido"]),
  time: z.enum(["30min", "1h", "2h", "dia_todo", "antecedencia"]),
  likes: z
    .array(
      z.enum([
        "filme",
        "jantar",
        "musica",
        "fotos",
        "cartas",
        "vinho",
        "doces",
        "massagem",
        "surpresa_quarto",
      ]),
    )
    .min(1),
  tier: z.enum(["basic", "premium"]).default("basic"),
});

export type SurpriseAnswers = z.infer<typeof SurpriseAnswersSchema>;
export type PlanTier = SurpriseAnswers["tier"];

export const NightPhaseSchema = z.enum([
  "entrada",
  "ambiente",
  "emocional",
  "jantar",
  "encerramento",
]);
export type NightPhase = z.infer<typeof NightPhaseSchema>;

export const TimelineSlotSchema = z.enum(["2h", "1h30", "1h", "30min", "10min", "chegada"]);
export type TimelineSlot = z.infer<typeof TimelineSlotSchema>;

export const ShoppingTierSchema = z.enum(["essential", "optional", "premium"]);
export type ShoppingTier = z.infer<typeof ShoppingTierSchema>;

export const WhereToBuySchema = z.enum(["mercado", "papelaria", "festa", "variedades", "online"]);
export type WhereToBuy = z.infer<typeof WhereToBuySchema>;

export const DifficultySchema = z.enum(["facil", "medio", "caprichado"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

const emptyPhrasesByMoment = {
  entrada: "",
  mesa: "",
  bilhete: "",
  whatsapp: "",
  encerramento: "",
};

const emptyBudgetPlans = {
  upTo50: [] as string[],
  upTo100: [] as string[],
  upTo200: [] as string[],
};

const emptyPremiumExtras = {
  decorationThemes: [] as { name: string; items: string }[],
  playlists: [] as { mood: string; tip: string }[],
  giftsByBudget: [] as { range: string; ideas: string }[],
  cardTemplates: [] as string[],
  extraScripts: [] as string[],
  dinnerIdeas: [] as string[],
  emergencyPlan: [] as string[],
};

export const SurprisePlanSchema = z.object({
  title: z.string(),
  concept: z.string(),
  summary: z.object({
    difficulty: DifficultySchema,
    nightMood: z.string(),
    estimatedBudget: z.string(),
  }),
  nightMap: z
    .array(
      z.object({
        phase: NightPhaseSchema,
        title: z.string(),
        description: z.string(),
        microTip: z.string().optional(),
      }),
    )
    .length(5),
  decoration: z.object({
    byEnvironment: z.array(
      z.object({
        zone: z.string(),
        items: z.array(z.string()),
      }),
    ),
    lighting: z.string(),
    tableOrBed: z.string(),
    photosAndNotes: z.string(),
    scentAndMusic: z.string(),
    sensoryDetails: z.array(z.string()),
  }),
  shopping: z.object({
    items: z.array(
      z.object({
        name: z.string(),
        quantity: z.string(),
        priceEstimate: z.string(),
        whereToBuy: WhereToBuySchema,
        tier: ShoppingTierSchema,
      }),
    ),
  }),
  timeline: z
    .array(
      z.object({
        slot: TimelineSlotSchema,
        task: z.string(),
      }),
    )
    .length(6),
  budgetPlans: z
    .object({
      upTo50: z.array(z.string()),
      upTo100: z.array(z.string()),
      upTo200: z.array(z.string()),
    })
    .default(emptyBudgetPlans),
  phrasesByMoment: z
    .object({
      entrada: z.string(),
      mesa: z.string(),
      bilhete: z.string(),
      whatsapp: z.string(),
      encerramento: z.string(),
    })
    .default(emptyPhrasesByMoment),
  avoidMistakes: z.array(z.string()),
  checklist: z.array(z.string()).default([]),
  premiumExtras: z
    .object({
      decorationThemes: z.array(z.object({ name: z.string(), items: z.string() })),
      playlists: z.array(z.object({ mood: z.string(), tip: z.string() })),
      giftsByBudget: z.array(z.object({ range: z.string(), ideas: z.string() })),
      cardTemplates: z.array(z.string()),
      extraScripts: z.array(z.string()),
      dinnerIdeas: z.array(z.string()),
      emergencyPlan: z.array(z.string()),
    })
    .default(emptyPremiumExtras),
});

export type SurprisePlan = z.infer<typeof SurprisePlanSchema>;

export const NIGHT_PHASE_LABELS: Record<NightPhase, string> = {
  entrada: "Entrada",
  ambiente: "Ambiente principal",
  emocional: "Momento emocional",
  jantar: "Jantar / sobremesa",
  encerramento: "Encerramento especial",
};

export const TIMELINE_SLOT_LABELS: Record<TimelineSlot, string> = {
  "2h": "2 horas antes",
  "1h30": "1h30 antes",
  "1h": "1 hora antes",
  "30min": "30 minutos antes",
  "10min": "10 minutos antes",
  chegada: "Hora da chegada",
};

export const WHERE_TO_BUY_LABELS: Record<WhereToBuy, string> = {
  mercado: "Mercado",
  papelaria: "Papelaria",
  festa: "Loja de festa",
  variedades: "Variedades",
  online: "Online",
};

export const SHOPPING_TIER_LABELS: Record<ShoppingTier, string> = {
  essential: "Essencial",
  optional: "Opcional",
  premium: "Premium",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facil: "Fácil",
  medio: "Médio",
  caprichado: "Caprichado",
};

export const LABELS = {
  recipient: {
    namorada: "Namorada",
    namorado: "Namorado",
    esposa: "Esposa",
    marido: "Marido",
    ficante: "Ficante",
    noivo_noiva: "Noivo(a)",
  },
  place: {
    quarto: "Quarto",
    sala: "Sala",
    mesa: "Mesa de jantar",
    varanda: "Varanda",
    hotel: "Hotel/Airbnb",
    casa_inteira: "Casa inteira",
  },
  budget: {
    "50": "Até R$50",
    "100": "Até R$100",
    "200": "Até R$200",
    caprichar: "Quero caprichar",
  },
  style: {
    fofo: "Fofo e romântico",
    elegante: "Elegante",
    sensual: "Sensual/intimista",
    simples: "Simples e bonito",
    pinterest: "Estilo Pinterest",
    pedido: "Pedido especial",
  },
  time: {
    "30min": "30 minutos",
    "1h": "1 hora",
    "2h": "2 horas",
    dia_todo: "Tenho o dia todo",
    antecedencia: "Vou preparar com antecedência",
  },
  likes: {
    filme: "Filme",
    jantar: "Jantar",
    musica: "Música",
    fotos: "Fotos",
    cartas: "Cartas",
    vinho: "Vinho",
    doces: "Doces",
    massagem: "Massagem",
    surpresa_quarto: "Surpresa no quarto",
  },
} as const;

export const PLAN_STYLE_THEMES: Record<string, string> = {
  fofo: "plan-theme-fofo",
  elegante: "plan-theme-elegant",
  sensual: "plan-theme-sensual",
  simples: "plan-theme-simples",
  pinterest: "plan-theme-pinterest",
  pedido: "plan-theme-pedido",
};
