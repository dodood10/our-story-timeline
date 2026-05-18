import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import {
  SHOPPING_TIER_LABELS,
  WHERE_TO_BUY_LABELS,
  type ShoppingTier,
  type SurprisePlan,
} from "@/lib/surprise-types";
import { cn } from "@/lib/utils";
import { PlanSection } from "./PlanSection";
import { PLAN_COPY } from "./plan-copy";

const TIERS: ShoppingTier[] = ["essential", "optional", "premium"];
const STORAGE_KEY = "ml.surprise.shopping";

interface PlanShoppingListProps {
  items: SurprisePlan["shopping"]["items"];
}

export function PlanShoppingList({ items }: PlanShoppingListProps) {
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
    if (!hydrated) return;
    setChecked((c) => {
      const next = { ...c, [key]: !c[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <PlanSection id="shopping" icon={ShoppingBag} title={PLAN_COPY.shopping}>
      <div className="space-y-5">
        {TIERS.map((tier) => {
          const tierItems = items.filter((it) => it.tier === tier);
          if (tierItems.length === 0) return null;
          return (
            <div key={tier}>
              <p
                className={cn(
                  "text-sm font-medium mb-2",
                  tier === "essential" ? "text-primary" : "text-muted-foreground",
                )}
              >
                {SHOPPING_TIER_LABELS[tier]}
              </p>
              <ul className="space-y-2">
                {tierItems.map((it, i) => {
                  const key = `${tier}-${it.name}`;
                  const done = hydrated && checked[key];
                  return (
                    <li
                      key={i}
                      className={cn(
                        "rounded-xl border border-border p-3 flex gap-3",
                        done && "opacity-60 bg-muted/30",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={!!done}
                        onChange={() => toggle(key)}
                        className="mt-1 accent-primary shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            done && "line-through text-muted-foreground",
                          )}
                        >
                          {it.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {it.quantity} · {it.priceEstimate}
                        </p>
                        <span className="inline-block mt-2 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {WHERE_TO_BUY_LABELS[it.whereToBuy]}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </PlanSection>
  );
}
