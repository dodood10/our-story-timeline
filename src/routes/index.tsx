import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/hooks/useApp";
import { daysTogether, upcomingMilestones, formatDatePT } from "@/lib/dates";
import { Heart, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Memory Lane — Início" },
      { name: "description", content: "Sua história, contada dia após dia." },
    ],
  }),
  component: HomePage,
});

const STATUS_LABEL: Record<string, string> = { dating: "Namorando", engaged: "Noivos", married: "Casados" };

function HomePage() {
  const { couple, hydrated, memories } = useApp();
  if (!hydrated) return <PageSkeleton />;
  if (!couple) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-3 animate-float-heart" />
          <p className="font-display text-2xl">Quase lá...</p>
          <p className="text-muted-foreground">Complete o cadastro do casal para começar.</p>
        </div>
      </div>
    );
  }

  const days = daysTogether(couple.startDate);
  const milestones = upcomingMilestones(couple.startDate);
  const recent = memories.slice(0, 3);

  return (
    <div className="px-4 sm:px-8 py-8 sm:py-12 max-w-5xl mx-auto space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl bg-gradient-romantic p-6 sm:p-10 shadow-soft"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-card overflow-hidden border-4 border-card shadow-card">
              {couple.photo ? (
                <img src={couple.photo} alt="Casal" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-5xl">💕</div>
              )}
            </div>
            <Heart className="absolute -bottom-1 -right-1 h-7 w-7 text-primary fill-primary bg-card rounded-full p-1" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-widest text-foreground/60 mb-1">{STATUS_LABEL[couple.status]}</p>
            <h1 className="font-display text-3xl sm:text-4xl mb-1">{couple.name1} <span className="text-primary">&</span> {couple.name2}</h1>
            <p className="text-foreground/70 inline-flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5" /> Desde {formatDatePT(couple.startDate)}
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center py-6"
      >
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Estamos juntos há</p>
        <p className="font-display text-7xl sm:text-8xl text-gradient-romantic leading-none">{days.toLocaleString("pt-BR")}</p>
        <p className="font-display text-2xl mt-2">dias</p>
      </motion.section>

      {milestones.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-xl">Próximas datas</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {milestones.map((m) => (
              <div key={m.label + m.daysLeft} className="rounded-2xl bg-card p-4 border border-border shadow-card flex items-center justify-between">
                <div>
                  <p className="font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{formatDatePT(m.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-primary">{m.daysLeft}</p>
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wider">dias</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <h2 className="font-display text-xl mb-3">Memórias recentes</h2>
          <div className="space-y-2">
            {recent.map((m) => (
              <div key={m.id} className="rounded-xl bg-card p-3 border border-border flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {m.photos[0] ? <img src={m.photos[0]} alt="" className="h-full w-full object-cover rounded-full" /> : "💞"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDatePT(m.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="p-12 flex items-center justify-center">
      <Heart className="h-10 w-10 text-primary animate-float-heart" />
    </div>
  );
}
