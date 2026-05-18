import { Copy, MessageCircleHeart } from "lucide-react";
import { toast } from "sonner";
import type { SurprisePlan } from "@/lib/surprise-types";
import { Button } from "@/components/ui/button";
import { PlanPremiumGate } from "./PlanPremiumGate";
import { PLAN_COPY } from "./plan-copy";

const MOMENT_LABELS: Record<keyof SurprisePlan["phrasesByMoment"], string> = {
  entrada: "Entrada",
  mesa: "Mesa",
  bilhete: "Bilhete",
  whatsapp: "WhatsApp",
  encerramento: "Encerramento",
};

interface PlanPhrasesByMomentProps {
  phrases: SurprisePlan["phrasesByMoment"];
  isPremium: boolean;
}

export function PlanPhrasesByMoment({ phrases, isPremium }: PlanPhrasesByMomentProps) {
  const entries = Object.entries(phrases) as [keyof typeof phrases, string][];
  const hasContent = entries.some(([, v]) => v.trim().length > 0);

  async function copyPhrase(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Frase copiada!");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  return (
    <PlanPremiumGate
      id="phrases"
      icon={MessageCircleHeart}
      title={PLAN_COPY.phrases}
      isPremium={isPremium}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {(hasContent
          ? entries
          : (Object.keys(MOMENT_LABELS) as (keyof typeof phrases)[]).map((k) => [k, ""] as const)
        ).map(([key, text]) => (
          <div
            key={key}
            className="rounded-xl bg-secondary/50 border border-border p-3 flex flex-col gap-2"
          >
            <p className="text-[10px] uppercase tracking-wider text-primary font-medium">
              {MOMENT_LABELS[key]}
            </p>
            <p className="text-sm italic leading-relaxed flex-1">
              {text ? `"${text}"` : "Sua frase personalizada aparece aqui no Premium."}
            </p>
            {text && isPremium && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-end h-8"
                onClick={() => copyPhrase(text)}
              >
                <Copy className="h-3.5 w-3.5 mr-1" /> Copiar
              </Button>
            )}
          </div>
        ))}
      </div>
    </PlanPremiumGate>
  );
}
