import { Wallet } from "lucide-react";
import type { SurprisePlan } from "@/lib/surprise-types";
import { PlanPremiumGate } from "./PlanPremiumGate";
import { PLAN_COPY } from "./plan-copy";

interface PlanBudgetVariantsProps {
  budgetPlans: SurprisePlan["budgetPlans"];
  isPremium: boolean;
}

const BUDGET_CARDS = [
  { key: "upTo50" as const, label: "Até R$50", accent: "border-emerald-500/30 bg-emerald-500/5" },
  { key: "upTo100" as const, label: "Até R$100", accent: "border-primary/30 bg-primary/5" },
  { key: "upTo200" as const, label: "Até R$200", accent: "border-amber-500/30 bg-amber-500/5" },
];

export function PlanBudgetVariants({ budgetPlans, isPremium }: PlanBudgetVariantsProps) {
  const hasContent = BUDGET_CARDS.some((c) => budgetPlans[c.key].length > 0);

  return (
    <PlanPremiumGate id="budget" icon={Wallet} title={PLAN_COPY.budgetPlans} isPremium={isPremium}>
      {hasContent ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {BUDGET_CARDS.map((card) => (
            <div key={card.key} className={`rounded-2xl border p-4 ${card.accent}`}>
              <p className="font-display text-lg">{card.label}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {budgetPlans[card.key].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <PlaceholderBudget />
      )}
    </PlanPremiumGate>
  );
}

function PlaceholderBudget() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {BUDGET_CARDS.map((card) => (
        <div key={card.key} className={`rounded-2xl border p-4 ${card.accent}`}>
          <p className="font-display text-lg">{card.label}</p>
          <ul className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <li key={i} className="h-3 rounded bg-muted/60" />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
