import { Heart } from "lucide-react";
import { benefits } from "@/lib/landing-content";

export function BenefitsSection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl text-center">{benefits.title}</h2>
        <ul className="mt-10 grid sm:grid-cols-2 gap-4">
          {benefits.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm"
            >
              <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5 fill-primary/20" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
