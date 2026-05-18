import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar } from "lucide-react";
import type { Couple } from "@/lib/types";
import { daysTogether, formatDatePT } from "@/lib/dates";
import { differenceInSeconds, parseISO } from "date-fns";

const STATUS_LABEL: Record<string, string> = {
  dating: "Namorando",
  engaged: "Noivos",
  married: "Casados",
};

export function Hero({ couple }: { couple: Couple }) {
  const days = daysTogether(couple.startDate);
  const [time, setTime] = useState(() => livedTime(couple.startDate));

  useEffect(() => {
    const id = window.setInterval(() => setTime(livedTime(couple.startDate)), 1000);
    return () => window.clearInterval(id);
  }, [couple.startDate]);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-romantic p-6 sm:p-12 shadow-soft">
      <FloatingHearts />
      <div className="relative flex flex-col sm:flex-row items-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative shrink-0"
        >
          <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-card overflow-hidden border-4 border-card shadow-card">
            {couple.photo ? (
              <img src={couple.photo} alt="Casal" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-6xl">💕</div>
            )}
          </div>
          <Heart className="absolute -bottom-1 -right-1 h-9 w-9 text-primary fill-primary bg-card rounded-full p-1.5 animate-float-heart" />
        </motion.div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs uppercase tracking-[0.25em] text-foreground/60 mb-2"
          >
            {STATUS_LABEL[couple.status]}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-display text-4xl sm:text-5xl mb-3"
          >
            {couple.name1} <span className="text-primary italic">&</span> {couple.name2}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="inline-flex items-center gap-1.5 text-sm text-foreground/70"
          >
            <Calendar className="h-3.5 w-3.5" /> Desde {formatDatePT(couple.startDate)}
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative mt-10 text-center"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/60 mb-3">
          Estamos juntos há
        </p>
        <div className="flex items-baseline justify-center gap-2 sm:gap-3 font-display">
          <AnimatedNumber
            value={days}
            className="text-6xl sm:text-8xl text-gradient-romantic leading-none"
          />
          <span className="text-2xl sm:text-3xl text-foreground/70">dias</span>
        </div>
        <div className="mt-4 flex justify-center gap-3 text-xs sm:text-sm text-foreground/60 font-mono">
          <Cell label="h" value={time.h} />
          <Cell label="m" value={time.m} />
          <Cell label="s" value={time.s} />
        </div>
      </motion.div>
    </section>
  );
}

function Cell({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-lg bg-card/50 backdrop-blur px-2.5 py-1 border border-border/50">
      {String(value).padStart(2, "0")}
      <span className="text-foreground/40 ml-1">{label}</span>
    </span>
  );
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {value.toLocaleString("pt-BR")}
      </motion.span>
    </AnimatePresence>
  );
}

function livedTime(startDate: string) {
  const total = Math.max(0, differenceInSeconds(new Date(), parseISO(startDate)));
  const sIntoDay = total % 86400;
  return {
    h: Math.floor(sIntoDay / 3600),
    m: Math.floor((sIntoDay % 3600) / 60),
    s: sIntoDay % 60,
  };
}

function FloatingHearts() {
  const positions = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        left: `${10 + i * 14}%`,
        delay: i * 0.4,
        size: 12 + (i % 3) * 4,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {positions.map((p, i) => (
        <motion.div
          key={i}
          initial={{ y: "120%", opacity: 0 }}
          animate={{ y: "-20%", opacity: [0, 0.6, 0] }}
          transition={{ duration: 9, delay: p.delay, repeat: Infinity, ease: "linear" }}
          style={{ left: p.left, width: p.size, height: p.size }}
          className="absolute"
        >
          <Heart className="w-full h-full text-primary/30 fill-primary/20" />
        </motion.div>
      ))}
    </div>
  );
}
