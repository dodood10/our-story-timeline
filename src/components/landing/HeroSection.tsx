import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { hero } from "@/lib/landing-content";
import { LandingCta } from "./LandingCta";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-4">
      <div className="absolute inset-0 bg-gradient-romantic opacity-40 -z-10" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            🏷️ {hero.pill}
          </span>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl mt-5 leading-[1.08] tracking-tight">
            {hero.title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-5 max-w-2xl mx-auto">
            {hero.subtitle}
          </p>
          <div className="mt-8 max-w-md mx-auto text-left">
            <p className="text-sm font-medium flex items-center gap-1.5 justify-center sm:justify-start">
              <Heart className="h-4 w-4 text-primary fill-primary/20" />
              {hero.idealForLabel}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {hero.idealFor.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-primary shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex flex-col items-center gap-2">
            <LandingCta plan="premium">💝 {hero.cta}</LandingCta>
            <p className="text-xs text-muted-foreground">✓ {hero.microcopy}</p>
            <p className="text-xs text-amber-800 dark:text-amber-200 max-w-md mt-2">
              ⚠️ {hero.urgencyWarning}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
