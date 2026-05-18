import { Clock, Gauge, Heart, Home, Moon, Palette, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DIFFICULTY_LABELS,
  LABELS,
  type SurpriseAnswers,
  type SurprisePlan,
} from "@/lib/surprise-types";
import { PLAN_COPY } from "./plan-copy";

interface PlanSummaryCardProps {
  plan: SurprisePlan;
  answers: SurpriseAnswers;
}

function SummaryChip({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl bg-background/80 border border-border/80 p-3 flex gap-2.5 items-start",
        className,
      )}
    >
      <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium leading-snug mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export function PlanSummaryCard({ plan, answers }: PlanSummaryCardProps) {
  const name = answers.partnerName?.trim() || "Sua pessoa especial";

  return (
    <div className="rounded-2xl bg-secondary/40 border border-border p-4 sm:p-5">
      <h2 className="font-display text-lg sm:text-xl mb-3 flex items-center gap-2">
        <Heart className="h-4 w-4 text-primary" />
        {PLAN_COPY.summary}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <SummaryChip icon={Heart} label="Homenageada(o)" value={name} />
        <SummaryChip icon={Palette} label="Estilo" value={LABELS.style[answers.style]} />
        <SummaryChip icon={Home} label="Ambiente" value={LABELS.place[answers.place]} />
        <SummaryChip icon={Clock} label="Montagem" value={LABELS.time[answers.time]} />
        <SummaryChip
          icon={Wallet}
          label="Orçamento"
          value={plan.summary.estimatedBudget || LABELS.budget[answers.budget]}
        />
        <SummaryChip
          icon={Gauge}
          label="Dificuldade"
          value={DIFFICULTY_LABELS[plan.summary.difficulty]}
        />
        <SummaryChip
          icon={Moon}
          label="Clima da noite"
          value={plan.summary.nightMood}
          className="col-span-2 sm:col-span-3"
        />
      </div>
    </div>
  );
}
