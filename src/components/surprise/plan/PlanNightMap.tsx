import { DoorOpen, Home, Heart, UtensilsCrossed, Sparkles } from "lucide-react";
import type { NightPhase, SurprisePlan } from "@/lib/surprise-types";
import { NIGHT_PHASE_LABELS } from "@/lib/surprise-types";
import { PLAN_COPY } from "./plan-copy";

const PHASE_ICONS: Record<NightPhase, React.ComponentType<{ className?: string }>> = {
  entrada: DoorOpen,
  ambiente: Home,
  emocional: Heart,
  jantar: UtensilsCrossed,
  encerramento: Sparkles,
};

interface PlanNightMapProps {
  nightMap: SurprisePlan["nightMap"];
}

export function PlanNightMap({ nightMap }: PlanNightMapProps) {
  return (
    <div>
      <h2 className="font-display text-xl sm:text-2xl mb-4">{PLAN_COPY.nightMap}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {nightMap.map((moment) => {
          const Icon = PHASE_ICONS[moment.phase];
          return (
            <article
              key={moment.phase}
              className="snap-start shrink-0 w-[min(85vw,280px)] rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <p className="text-[10px] uppercase tracking-wider text-primary font-medium">
                  {NIGHT_PHASE_LABELS[moment.phase]}
                </p>
              </div>
              <h3 className="font-display text-lg leading-tight">{moment.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {moment.description}
              </p>
              {moment.microTip && (
                <p className="text-xs mt-3 pt-3 border-t border-border/60 text-foreground/80">
                  <span className="font-medium text-primary">Dica: </span>
                  {moment.microTip}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
