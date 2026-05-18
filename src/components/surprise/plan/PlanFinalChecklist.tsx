import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { SurprisePlan } from "@/lib/surprise-types";
import { PlanPremiumGate } from "./PlanPremiumGate";
import { PLAN_COPY } from "./plan-copy";

const STORAGE_KEY = "ml.surprise.checklist";

interface PlanFinalChecklistProps {
  items: SurprisePlan["checklist"];
  isPremium: boolean;
}

export function PlanFinalChecklist({ items, isPremium }: PlanFinalChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* */
    }
    setHydrated(true);
  }, []);

  function toggle(key: string) {
    if (!hydrated || !isPremium) return;
    setChecked((c) => {
      const next = { ...c, [key]: !c[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const displayItems =
    items.length > 0
      ? items
      : [
          "Ambiente arrumado e iluminação testada",
          "Música ou playlist pronta",
          "Comida/bebida na temperatura certa",
          "Celular no silencioso",
          "Bilhete ou presente no lugar certo",
        ];

  const doneCount = displayItems.filter((it) => checked[it]).length;
  const progress = displayItems.length ? (doneCount / displayItems.length) * 100 : 0;

  return (
    <PlanPremiumGate
      id="checklist"
      icon={ListChecks}
      title={PLAN_COPY.checklist}
      isPremium={isPremium}
    >
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progresso</span>
          <span>
            {doneCount} de {displayItems.length} prontos
          </span>
        </div>
        <Progress value={isPremium ? progress : 0} className="h-2" />
      </div>
      <ul className="space-y-2">
        {displayItems.map((it, i) => (
          <li key={i}>
            <label
              className={`flex gap-3 items-start rounded-xl border border-border p-3 text-sm ${
                isPremium ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <input
                type="checkbox"
                disabled={!isPremium}
                checked={hydrated && isPremium ? !!checked[it] : false}
                onChange={() => toggle(it)}
                className="mt-0.5 accent-primary shrink-0 h-4 w-4"
              />
              <span className={hydrated && checked[it] ? "line-through text-muted-foreground" : ""}>
                {it}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </PlanPremiumGate>
  );
}
