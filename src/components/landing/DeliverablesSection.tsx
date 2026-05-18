import { motion } from "framer-motion";
import { deliverables } from "@/lib/landing-content";

export function DeliverablesSection() {
  return (
    <section id="entregas" className="py-16 sm:py-24 bg-gradient-soft scroll-mt-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl">{deliverables.title}</h2>
          <p className="text-muted-foreground mt-3">{deliverables.subtitle}</p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {deliverables.items.map((item, i) => (
            <motion.article
              key={item.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl bg-card border border-border p-5 shadow-card"
            >
              <p className="text-xs font-medium text-primary uppercase tracking-wider">
                {item.n}. {item.emoji}
                {item.tier === "premium" && (
                  <span className="ml-2 text-muted-foreground normal-case">Premium</span>
                )}
              </p>
              <h3 className="font-display text-lg mt-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
        <p className="text-center mt-10 text-sm text-muted-foreground max-w-xl mx-auto">
          {deliverables.closing}
        </p>
      </div>
    </section>
  );
}
