import type { SurpriseAnswers, SurprisePlan } from "@/lib/surprise-types";
import { PlanHero } from "./PlanHero";
import { PlanSummaryCard } from "./PlanSummaryCard";
import { PlanNightMap } from "./PlanNightMap";
import { PlanDecoration } from "./PlanDecoration";
import { PlanShoppingList } from "./PlanShoppingList";
import { PlanTimeline } from "./PlanTimeline";
import { PlanBudgetVariants } from "./PlanBudgetVariants";
import { PlanPhrasesByMoment } from "./PlanPhrasesByMoment";
import { PlanAvoidSection } from "./PlanAvoidSection";
import { PlanFinalChecklist } from "./PlanFinalChecklist";
import { PlanPremiumKit } from "./PlanPremiumKit";

interface PlanResultViewProps {
  plan: SurprisePlan;
  answers: SurpriseAnswers;
  isPremium: boolean;
}

export function PlanResultView({ plan, answers, isPremium }: PlanResultViewProps) {
  return (
    <div className="space-y-8">
      <PlanHero
        title={plan.title}
        concept={plan.concept}
        partnerName={answers.partnerName}
        isPremium={isPremium}
      />

      <PlanSummaryCard plan={plan} answers={answers} />

      <PlanNightMap nightMap={plan.nightMap} />

      <PlanDecoration decoration={plan.decoration} />
      <PlanShoppingList items={plan.shopping.items} />
      <PlanTimeline timeline={plan.timeline} />

      <PlanAvoidSection items={plan.avoidMistakes} maxItems={isPremium ? undefined : 5} />

      <PlanBudgetVariants budgetPlans={plan.budgetPlans} isPremium={isPremium} />
      <PlanPhrasesByMoment phrases={plan.phrasesByMoment} isPremium={isPremium} />
      <PlanFinalChecklist items={plan.checklist} isPremium={isPremium} />

      <PlanPremiumKit extras={plan.premiumExtras} isPremium={isPremium} />
    </div>
  );
}
