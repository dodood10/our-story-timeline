import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/hooks/useApp";
import { upcomingMilestones, formatDatePT } from "@/lib/dates";
import { Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Hero } from "@/components/home/Hero";
import { OnThisDay } from "@/components/home/OnThisDay";
import { Photo } from "@/components/common/Photo";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Memory Lane — Início" },
      { name: "description", content: "Sua história, contada dia após dia." },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const { couple, hydrated, memories } = useApp();
  if (!hydrated) {
    return (
      <div className="p-12 flex items-center justify-center">
        <Heart className="h-10 w-10 text-primary animate-float-heart" />
      </div>
    );
  }
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

  const milestones = upcomingMilestones(couple.startDate);
  const recent = memories.slice(0, 3);

  return (
    <div className="px-4 sm:px-8 py-8 sm:py-12 max-w-5xl mx-auto space-y-10">
      <Hero couple={couple} />
      <OnThisDay />

      {milestones.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-xl">Próximas datas</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {milestones.map((m, i) => (
              <motion.div
                key={m.label + m.daysLeft}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ y: -2 }}
                className="rounded-2xl bg-card p-4 border border-border shadow-card flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{formatDatePT(m.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-primary">{m.daysLeft}</p>
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wider">dias</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <h2 className="font-display text-xl mb-3">Memórias recentes</h2>
          <div className="space-y-2">
            {recent.map((m) => (
              <div key={m.id} className="rounded-xl bg-card p-3 border border-border flex items-center gap-3 transition hover:shadow-card">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl overflow-hidden">
                  {m.photos[0] ? <Photo src={m.photos[0]} alt="" className="h-full w-full object-cover" /> : "💞"}
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
