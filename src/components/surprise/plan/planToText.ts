import {
  NIGHT_PHASE_LABELS,
  SHOPPING_TIER_LABELS,
  TIMELINE_SLOT_LABELS,
  WHERE_TO_BUY_LABELS,
  DIFFICULTY_LABELS,
  type SurprisePlan,
} from "@/lib/surprise-types";

export function planToText(p: SurprisePlan): string {
  const L: string[] = [];
  L.push(p.title, "", p.concept, "");
  L.push("== RESUMO ==");
  L.push(`Dificuldade: ${DIFFICULTY_LABELS[p.summary.difficulty]}`);
  L.push(`Clima: ${p.summary.nightMood}`);
  L.push(`Orçamento estimado: ${p.summary.estimatedBudget}`);
  L.push("", "== MAPA DA NOITE ==");
  p.nightMap.forEach((m) => {
    L.push(`${NIGHT_PHASE_LABELS[m.phase]}: ${m.title}`);
    L.push(m.description);
    if (m.microTip) L.push(`Dica: ${m.microTip}`);
    L.push("");
  });
  L.push("== DECORAÇÃO ==");
  p.decoration.byEnvironment.forEach((z) => {
    L.push(z.zone);
    z.items.forEach((i) => L.push(`  • ${i}`));
  });
  L.push(`Iluminação: ${p.decoration.lighting}`);
  L.push(`Mesa/cama: ${p.decoration.tableOrBed}`);
  L.push(`Fotos/bilhetes: ${p.decoration.photosAndNotes}`);
  L.push(`Aroma/música: ${p.decoration.scentAndMusic}`);
  L.push("", "== COMPRAS ==");
  for (const tier of ["essential", "optional", "premium"] as const) {
    const items = p.shopping.items.filter((i) => i.tier === tier);
    if (!items.length) continue;
    L.push(SHOPPING_TIER_LABELS[tier] + ":");
    items.forEach((i) =>
      L.push(
        `  • ${i.name} (${i.quantity}, ${i.priceEstimate}) — ${WHERE_TO_BUY_LABELS[i.whereToBuy]}`,
      ),
    );
  }
  L.push("", "== CRONOGRAMA ==");
  p.timeline.forEach((t) => L.push(`${TIMELINE_SLOT_LABELS[t.slot]}: ${t.task}`));
  if (p.budgetPlans.upTo50.length) {
    L.push("", "== ATÉ R$50 ==");
    p.budgetPlans.upTo50.forEach((s) => L.push(`• ${s}`));
  }
  if (p.budgetPlans.upTo100.length) {
    L.push("", "== ATÉ R$100 ==");
    p.budgetPlans.upTo100.forEach((s) => L.push(`• ${s}`));
  }
  if (p.budgetPlans.upTo200.length) {
    L.push("", "== ATÉ R$200 ==");
    p.budgetPlans.upTo200.forEach((s) => L.push(`• ${s}`));
  }
  const phrases = Object.entries(p.phrasesByMoment).filter(([, v]) => v.trim());
  if (phrases.length) {
    L.push("", "== FRASES POR MOMENTO ==");
    phrases.forEach(([k, v]) => L.push(`${k}: "${v}"`));
  }
  if (p.avoidMistakes.length) {
    L.push("", "== O QUE EVITAR ==");
    p.avoidMistakes.forEach((s) => L.push(`• ${s}`));
  }
  if (p.checklist.length) {
    L.push("", "== CHECKLIST ==");
    p.checklist.forEach((s) => L.push(`☐ ${s}`));
  }
  return L.join("\n");
}
