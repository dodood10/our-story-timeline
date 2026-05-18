import { motion } from "framer-motion";
import { problem } from "@/lib/landing-content";

export function ProblemSection() {
  return (
    <section className="py-16 sm:py-24 bg-card/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl text-center">{problem.title}</h2>
        <p className="text-center text-muted-foreground mt-4">{problem.subtitle}</p>
        <p className="mt-8 text-sm text-muted-foreground">
          Se você se identifica com algumas dessas situações:
        </p>
        <ul className="mt-4 space-y-3">
          {problem.bullets.map((p, i) => (
            <motion.li
              key={p}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border"
            >
              <span className="text-lg shrink-0">❌</span>
              <span className="pt-0.5">{p}</span>
            </motion.li>
          ))}
        </ul>
        <p className="mt-10 text-center font-display text-xl sm:text-2xl whitespace-pre-line">
          {problem.conclusion}
        </p>
        <p className="text-center mt-6 text-muted-foreground">{problem.transition}</p>
      </div>
    </section>
  );
}
