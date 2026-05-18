import { whyCheap } from "@/lib/landing-content";

export function WhyCheapSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl text-center">{whyCheap.title}</h2>
        <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
          {whyCheap.paragraphs.map((p) => (
            <p key={p.slice(0, 50)}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
