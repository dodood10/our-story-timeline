import { curiosity } from "@/lib/landing-content";

export function CuriositySection() {
  return (
    <section className="py-16 sm:py-24 bg-card/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl text-center">{curiosity.title}</h2>
        <ul className="mt-8 space-y-2 text-center text-muted-foreground">
          {curiosity.negatives.map((line) => (
            <li key={line} className="text-base sm:text-lg">
              {line}
            </li>
          ))}
        </ul>
        <blockquote className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <p className="text-foreground leading-relaxed text-center">{curiosity.insight}</p>
        </blockquote>
        <p className="mt-8 text-center font-medium text-foreground">{curiosity.payoff}</p>
      </div>
    </section>
  );
}
