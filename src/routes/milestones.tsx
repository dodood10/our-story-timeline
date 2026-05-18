import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/hooks/useApp";
import { computeBadges } from "@/lib/badges";
import { Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/milestones")({
  head: () => ({
    meta: [
      { title: "Conquistas — Memory Lane" },
      { name: "description", content: "Badges e marcos do relacionamento." },
    ],
  }),
  component: MilestonesPage,
});

function MilestonesPage() {
  const { couple, memories, bucket } = useApp();
  const badges = computeBadges(couple, memories, bucket);
  const next = badges.find((b) => !b.unlocked && b.progress);

  return (
    <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
      <PageHeader
        icon={Trophy}
        title="Conquistas"
        subtitle={`${badges.filter((b) => b.unlocked).length} de ${badges.length} desbloqueadas`}
        className="mb-6"
      />

      {next && next.progress && (
        <div className="rounded-2xl bg-gradient-romantic p-5 mb-6 shadow-soft">
          <p className="text-xs uppercase tracking-widest text-foreground/70 mb-1">
            Próxima conquista
          </p>
          <p className="font-display text-xl mb-3">
            {next.icon} {next.title}
          </p>
          <Progress value={(next.progress.current / next.progress.target) * 100} />
          <p className="text-xs text-foreground/70 mt-1.5">
            {next.progress.current} / {next.progress.target}
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`rounded-2xl p-5 border transition ${
              b.unlocked
                ? "bg-card border-primary/30 shadow-card"
                : "bg-muted/40 border-border opacity-70"
            }`}
          >
            <div className={`text-4xl mb-2 ${b.unlocked ? "" : "grayscale"}`}>{b.icon}</div>
            <p className="font-display text-lg">{b.title}</p>
            <p className="text-xs text-muted-foreground mb-2">{b.description}</p>
            {b.progress && (
              <>
                <Progress
                  value={(b.progress.current / b.progress.target) * 100}
                  className="h-1.5"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {b.progress.current}/{b.progress.target}
                </p>
              </>
            )}
            {b.unlocked && <p className="text-xs text-primary font-medium mt-2">✓ Desbloqueada</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
