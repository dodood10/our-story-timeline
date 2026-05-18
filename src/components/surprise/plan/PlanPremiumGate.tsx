import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PlanSection } from "./PlanSection";

interface PlanPremiumGateProps {
  id: string;
  icon: LucideIcon;
  title: string;
  isPremium: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function PlanPremiumGate({
  id,
  icon,
  title,
  isPremium,
  children,
  defaultOpen = false,
}: PlanPremiumGateProps) {
  if (isPremium) {
    return (
      <PlanSection id={id} icon={icon} title={title} defaultOpen={defaultOpen}>
        {children}
      </PlanSection>
    );
  }

  return (
    <PlanSection id={id} icon={icon} title={title} defaultOpen={defaultOpen}>
      <div className="relative rounded-2xl border border-dashed border-primary/30 overflow-hidden">
        <div className="blur-sm select-none pointer-events-none opacity-70 p-4 min-h-[120px]">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] p-4 text-center">
          <Lock className="h-5 w-5 text-muted-foreground mb-2" />
          <Link
            to="/surprise"
            search={{ plan: "premium" }}
            className="text-sm font-medium text-primary hover:underline"
          >
            Disponível no Premium →
          </Link>
        </div>
      </div>
    </PlanSection>
  );
}
