import { describe, expect, it } from "vitest";
import { SurprisePlanSchema } from "./surprise-types";

const minimalPlan = {
  title: "Noite da Bianca",
  concept: "Uma surpresa íntima no quarto.",
  summary: {
    difficulty: "medio" as const,
    nightMood: "Íntimo e acolhedor",
    estimatedBudget: "R$80–120",
  },
  nightMap: [
    {
      phase: "entrada",
      title: "Porta",
      description: "Música baixa.",
      microTip: "Silencie o celular.",
    },
    { phase: "ambiente", title: "Quarto", description: "Luzes âmbar.", microTip: "Teste antes." },
    {
      phase: "emocional",
      title: "Carta",
      description: "Leia o bilhete.",
      microTip: "Olhe nos olhos.",
    },
    { phase: "jantar", title: "Mesa", description: "Jantar leve.", microTip: "Prato favorito." },
    { phase: "encerramento", title: "Filme", description: "Filme dela.", microTip: "Manta extra." },
  ],
  decoration: {
    byEnvironment: [{ zone: "Quarto", items: ["Velas LED âmbar (4 un)"] }],
    lighting: "Abajur + fita LED",
    tableOrBed: "Lençol limpo e travesseiros extras",
    photosAndNotes: "Fotos na corda de luz",
    scentAndMusic: "Difusor de lavanda + playlist MPB",
    sensoryDetails: ["Textura macia", "Aroma suave"],
  },
  shopping: {
    items: [
      {
        name: "Velas LED",
        quantity: "4 un",
        priceEstimate: "R$25",
        whereToBuy: "festa" as const,
        tier: "essential" as const,
      },
    ],
  },
  timeline: [
    { slot: "2h", task: "Comprar itens" },
    { slot: "1h30", task: "Arrumar quarto" },
    { slot: "1h", task: "Montar mesa" },
    { slot: "30min", task: "Trocar roupa" },
    { slot: "10min", task: "Acender velas" },
    { slot: "chegada", task: "Receber com sorriso" },
  ],
  avoidMistakes: ["Não deixe luz forte"],
};

describe("SurprisePlanSchema", () => {
  it("parses a valid v2 plan", () => {
    const result = SurprisePlanSchema.safeParse(minimalPlan);
    expect(result.success).toBe(true);
  });

  it("rejects legacy v1 shape", () => {
    const legacy = {
      title: "Old",
      concept: "Old",
      decoration: { setup: [], lighting: "", photos: "", avoid: [] },
      shopping: { essential: [], optional: [] },
      timeline: [{ time: "1h", task: "x" }],
      nightScript: ["step"],
    };
    expect(SurprisePlanSchema.safeParse(legacy).success).toBe(false);
  });
});
