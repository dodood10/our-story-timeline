import { CheckCircle2 } from "lucide-react";
import { trustBadges, trustStats } from "@/lib/landing-content";
import { LandingCta } from "./LandingCta";

export function TrustBadgesSection() {
  return (
    <section className="py-12 sm:py-16 border-y border-border bg-card/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {trustBadges.map((badge) => (
            <div
              key={badge}
              className="flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{badge}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <LandingCta plan="premium" className="px-8">
            👉 Quero meu método completo agora
          </LandingCta>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
          {trustStats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-xl sm:text-2xl text-primary">{s.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
