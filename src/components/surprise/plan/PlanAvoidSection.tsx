import { AlertTriangle } from "lucide-react";
import { PlanSection } from "./PlanSection";
import { PLAN_COPY } from "./plan-copy";

interface PlanAvoidSectionProps {
  items: string[];
  maxItems?: number;
}

export function PlanAvoidSection({ items, maxItems }: PlanAvoidSectionProps) {
  const list = maxItems ? items.slice(0, maxItems) : items;
  if (list.length === 0) return null;

  return (
    <PlanSection id="avoid" icon={AlertTriangle} title={PLAN_COPY.avoid} defaultOpen={false}>
      <ul className="space-y-2">
        {list.map((item, i) => (
          <li
            key={i}
            className="flex gap-3 text-sm rounded-xl border border-destructive/20 bg-destructive/5 p-3"
          >
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </PlanSection>
  );
}
