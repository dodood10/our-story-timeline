import { useMemo } from "react";
import { useApp } from "@/hooks/useApp";
import { parseISO, format, differenceInCalendarYears } from "date-fns";
import { Sparkles } from "lucide-react";
import { Photo } from "@/components/common/Photo";
import { motion } from "framer-motion";

export function OnThisDay() {
  const { memories } = useApp();
  const today = new Date();
  const mmdd = format(today, "MM-dd");

  const matches = useMemo(() => {
    return memories
      .filter((m) => format(parseISO(m.date), "MM-dd") === mmdd && parseISO(m.date).getFullYear() < today.getFullYear())
      .sort((a, b) => +parseISO(b.date) - +parseISO(a.date));
  }, [memories, mmdd, today]);

  if (matches.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-primary/20 bg-primary/5 p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg">Neste dia</h2>
      </div>
      <div className="space-y-2">
        {matches.map((m) => {
          const yearsAgo = differenceInCalendarYears(today, parseISO(m.date));
          return (
            <div key={m.id} className="flex items-center gap-3 rounded-xl bg-card p-3 border border-border">
              <div className="h-12 w-12 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center text-xl">
                {m.photos[0] ? (
                  <Photo src={m.photos[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  "💞"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{m.title}</p>
                <p className="text-xs text-muted-foreground">
                  Há {yearsAgo} {yearsAgo === 1 ? "ano" : "anos"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
