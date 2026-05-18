import { Sparkles } from "lucide-react";
import type { SurprisePlan } from "@/lib/surprise-types";
import { PlanSection } from "./PlanSection";
import { PLAN_COPY } from "./plan-copy";

function DetailCard({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 border border-border p-3 sm:p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm mt-1.5 leading-relaxed">{text}</p>
    </div>
  );
}

interface PlanDecorationProps {
  decoration: SurprisePlan["decoration"];
}

export function PlanDecoration({ decoration }: PlanDecorationProps) {
  return (
    <PlanSection id="decoration" icon={Sparkles} title={PLAN_COPY.decoration}>
      <div className="space-y-4">
        {decoration.byEnvironment.map((zone, i) => (
          <div key={i} className="rounded-xl border border-border bg-background/50 p-4">
            <p className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {zone.zone}
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {zone.items.map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="grid sm:grid-cols-2 gap-3">
          <DetailCard label="Iluminação" text={decoration.lighting} />
          <DetailCard label="Mesa ou cama" text={decoration.tableOrBed} />
          <DetailCard label="Fotos e bilhetes" text={decoration.photosAndNotes} />
          <DetailCard label="Aroma e música" text={decoration.scentAndMusic} />
        </div>

        {decoration.sensoryDetails.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Detalhes sensoriais</p>
            <ul className="flex flex-wrap gap-2">
              {decoration.sensoryDetails.map((d, i) => (
                <li
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PlanSection>
  );
}
