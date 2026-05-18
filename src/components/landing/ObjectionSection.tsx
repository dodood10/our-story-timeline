import { Check } from "lucide-react";
import { objection } from "@/lib/landing-content";

export function ObjectionSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-card text-center">
          <h2 className="font-display text-2xl sm:text-3xl">{objection.title}</h2>
          <p className="mt-4 text-muted-foreground">{objection.intro}</p>
          <p className="mt-6 text-sm font-medium text-left">{objection.bulletsLead}</p>
          <ul className="mt-3 space-y-2 text-left text-sm text-muted-foreground">
            {objection.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 font-display text-xl text-foreground">{objection.closing}</p>
        </div>
      </div>
    </section>
  );
}
