import { Heart } from "lucide-react";
import { finalCta } from "@/lib/landing-content";
import { LandingCta } from "./LandingCta";

export function FinalCtaSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <Heart className="h-10 w-10 text-primary mx-auto animate-float-heart fill-primary/20" />
        <h2 className="font-display text-3xl sm:text-4xl mt-6">{finalCta.title}</h2>
        <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
          {finalCta.paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
        <LandingCta plan="premium" className="mt-10 px-8">
          ❤️ {finalCta.cta}
        </LandingCta>
        <p className="text-xs text-muted-foreground mt-4">{finalCta.microcopy}</p>
      </div>
    </section>
  );
}
