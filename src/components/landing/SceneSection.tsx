import { scene } from "@/lib/landing-content";

export function SceneSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl text-center">{scene.title}</h2>
        <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
          {scene.paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
        <blockquote className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center">
          <p className="font-display text-xl sm:text-2xl whitespace-pre-line text-foreground">
            {scene.quote}
          </p>
        </blockquote>
      </div>
    </section>
  );
}
