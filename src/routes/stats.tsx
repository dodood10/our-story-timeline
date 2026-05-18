import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useApp } from "@/hooks/useApp";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart3, Camera, Sparkles, MapPin } from "lucide-react";
import { EMOTIONS } from "@/lib/types";
import { parseISO } from "date-fns";
import { upcomingMilestones, formatDatePT, formatMonthPT } from "@/lib/dates";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Estatísticas — Memory Lane" },
      { name: "description", content: "Estatísticas e gráficos do relacionamento." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const { memories, couple } = useApp();
  const totalPhotos = memories.reduce((s, m) => s + m.photos.length, 0);

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of memories) {
      const key = formatMonthPT(m.date);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([month, count]) => ({ month, count }))
      .slice(-12);
  }, [memories]);

  const topEmotion = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of memories) counts.set(m.emotion, (counts.get(m.emotion) ?? 0) + 1);
    const entry = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (!entry) return null;
    return EMOTIONS.find((e) => e.id === entry[0]);
  }, [memories]);

  const topPlaces = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of memories) {
      if (m.location) counts.set(m.location, (counts.get(m.location) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [memories]);

  const milestones = couple ? upcomingMilestones(couple.startDate).slice(0, 3) : [];

  return (
    <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto space-y-6">
      <PageHeader icon={BarChart3} title="Estatísticas" subtitle="Os números dessa história." />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Memórias"
          value={memories.length}
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatCard label="Fotos" value={totalPhotos} icon={<Camera className="h-4 w-4" />} />
        <StatCard
          label="Emoção top"
          value={topEmotion?.emoji ?? "—"}
          valueClass="text-3xl"
          sub={topEmotion?.label}
        />
        <StatCard
          label="Lugares"
          value={new Set(memories.map((m) => m.location).filter(Boolean)).size}
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>

      <section className="rounded-2xl bg-card border border-border p-5 shadow-card">
        <h2 className="font-display text-xl mb-4">Memórias por mês</h2>
        {byMonth.length === 0 ? (
          <p className="text-sm text-muted-foreground">Adicione memórias para ver o gráfico.</p>
        ) : (
          <>
            <p className="sr-only">
              Gráfico de memórias por mês: {byMonth.map((r) => `${r.month} ${r.count}`).join(", ")}.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <section className="rounded-2xl bg-card border border-border p-5 shadow-card">
          <h2 className="font-display text-xl mb-3">Lugares favoritos</h2>
          {topPlaces.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Marque a localização nas memórias para aparecerem aqui.
            </p>
          ) : (
            <ol className="space-y-2">
              {topPlaces.map(([place, count], i) => (
                <li key={place} className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{place}</span>
                  <span className="text-xs text-muted-foreground">{count}×</span>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="rounded-2xl bg-card border border-border p-5 shadow-card">
          <h2 className="font-display text-xl mb-3">Próximas datas</h2>
          {milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem datas próximas no horizonte.</p>
          ) : (
            <ul className="space-y-2">
              {milestones.map((m) => (
                <li key={m.label + m.daysLeft} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDatePT(m.date)}</p>
                  </div>
                  <p className="font-display text-lg text-primary">{m.daysLeft}d</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-card">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <p className={`font-display mt-1 ${valueClass ?? "text-3xl"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
