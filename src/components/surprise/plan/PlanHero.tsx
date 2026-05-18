import { Heart, Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { PLAN_COPY } from "./plan-copy";

interface PlanHeroProps {
  title: string;
  concept: string;
  partnerName?: string;
  isPremium: boolean;
}

export function PlanHero({ title, concept, partnerName, isPremium }: PlanHeroProps) {
  return (
    <header className="text-center">
      <Heart className="h-8 w-8 text-primary mx-auto fill-primary/20" />
      <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
        <Sparkles className="h-3 w-3" /> {BRAND_NAME} · Plano {isPremium ? "Premium" : "Básico"}
      </span>
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
        {PLAN_COPY.readyBadge}
      </p>
      {partnerName && (
        <p className="mt-2 text-sm text-muted-foreground">
          Criado especialmente para <span className="font-medium text-primary">{partnerName}</span>
        </p>
      )}
      <h1 className="font-display text-3xl sm:text-4xl mt-3 leading-tight">{title}</h1>
      <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
        {concept}
      </p>
    </header>
  );
}
