import { motion } from "framer-motion";
import { problem } from "@/lib/landing-content";

export function ProblemSection() {
  return (
    <section className="py-16 sm:py-24 bg-card/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl text-center">{problem.title}</h2>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {problem.reframes.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="text-center mt-6 text-muted-foreground">{problem.intro}</p>
        <p className="mt-8 text-sm text-muted-foreground">Então a maioria dos homens acaba fazendo:</p>
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
        <div className="mt-8 space-y-2 text-center text-sm text-muted-foreground italic">
          {problem.feelings.map((f) => (
            <p key={f}>{f}</p>
          ))}
        </div>
        <p className="mt-10 text-center font-display text-xl sm:text-2xl whitespace-pre-line">
          {problem.conclusion}
        </p>
        <div className="mt-10 text-center space-y-3">
          <p className="font-medium">{problem.methodIntro.lead}</p>
          <p className="text-muted-foreground">{problem.methodIntro.description}</p>
          <ul className="flex flex-wrap justify-center gap-2 text-sm">
            {problem.methodIntro.tags.map((t) => (
              <li
                key={t}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
