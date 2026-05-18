import { motion } from "framer-motion";
import { howItWorks } from "@/lib/landing-content";

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-16 sm:py-24 scroll-mt-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl">{howItWorks.title}</h2>
          <p className="text-muted-foreground mt-3">{howItWorks.subtitle}</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {howItWorks.steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-lg">
                {s.n}
              </div>
              <h3 className="font-display text-xl mt-4">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
