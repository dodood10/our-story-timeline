import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "@/lib/landing-content";
import { LandingCta } from "./LandingCta";

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-24 bg-card/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-2xl sm:text-3xl text-center max-w-2xl mx-auto">
          {testimonials.title}
        </h2>
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {testimonials.items.map((it, i) => (
            <motion.blockquote
              key={it.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed">&ldquo;{it.text}&rdquo;</p>
              <footer className="mt-4 text-xs text-muted-foreground">
                <strong className="text-foreground">{it.name}</strong>
                <span> · {it.context}</span>
              </footer>
            </motion.blockquote>
          ))}
        </div>
        <div className="mt-10 text-center">
          <LandingCta plan="premium">Quero fazer parte desses casais felizes</LandingCta>
        </div>
      </div>
    </section>
  );
}
