import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { MemoryFormDialog } from "@/components/memories/MemoryFormDialog";
import { TimelineFilters } from "@/components/memories/TimelineFilters";
import { Lightbox } from "@/components/gallery/Lightbox";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ShareCard } from "@/components/memories/ShareCard";
import { Plus, Clock } from "lucide-react";
import type { Memory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatDatePT } from "@/lib/dates";
import { parseISO } from "date-fns";
import { AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Linha do Tempo — Memory Lane" },
      { name: "description", content: "Todas as memórias de vocês em ordem cronológica." },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const { memories, deleteMemory, toggleFavoriteMemory, couple } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Memory | null>(null);
  const [year, setYear] = useState("all");
  const [emotion, setEmotion] = useState("all");
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [shareMem, setShareMem] = useState<Memory | null>(null);
  const [lightbox, setLightbox] = useState<{ photos: { src: string; title: string; date: string }[]; index: number } | null>(null);

  const years = useMemo(
    () => Array.from(new Set(memories.map((m) => parseISO(m.date).getFullYear()))).sort((a, b) => b - a),
    [memories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return memories
      .filter((m) => year === "all" || String(parseISO(m.date).getFullYear()) === year)
      .filter((m) => emotion === "all" || m.emotion === emotion)
      .filter((m) => !favoritesOnly || m.favorite)
      .filter((m) => {
        if (!q) return true;
        const hay = `${m.title} ${m.description} ${m.location ?? ""} ${(m.tags ?? []).join(" ")}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => +parseISO(b.date) - +parseISO(a.date));
  }, [memories, year, emotion, favoritesOnly, query]);

  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl flex items-center gap-2">
            <Clock className="h-7 w-7 text-primary" /> Linha do Tempo
          </h1>
          <p className="text-muted-foreground mt-1">Sua história, em ordem.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="hidden sm:inline-flex">
          <Plus className="h-4 w-4 mr-1" /> Nova memória
        </Button>
      </header>

      <div className="mb-6">
        <TimelineFilters
          years={years}
          year={year}
          emotion={emotion}
          query={query}
          favoritesOnly={favoritesOnly}
          onYearChange={setYear}
          onEmotionChange={setEmotion}
          onQueryChange={setQuery}
          onFavoritesChange={setFavoritesOnly}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={query || favoritesOnly || year !== "all" || emotion !== "all" ? "Nada encontrado" : "Ainda não há memórias"}
          description={query || favoritesOnly || year !== "all" || emotion !== "all" ? "Ajuste os filtros para ver mais." : "Adicione a primeira memória dessa história linda."}
          action={
            <Button onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Nova memória
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((m) => (
              <MemoryCard
                key={m.id}
                memory={m}
                onEdit={() => { setEditing(m); setOpen(true); }}
                onDelete={() => setConfirmId(m.id)}
                onToggleFavorite={() => toggleFavoriteMemory(m.id)}
                onShare={() => setShareMem(m)}
                onPhotoClick={(i) =>
                  setLightbox({
                    photos: m.photos.map((src) => ({ src, title: m.title, date: formatDatePT(m.date) })),
                    index: i,
                  })
                }
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <button
        onClick={() => { setEditing(null); setOpen(true); }}
        className="sm:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-soft flex items-center justify-center z-20 active:scale-95 transition"
        aria-label="Nova memória"
      >
        <Plus className="h-6 w-6" />
      </button>

      <MemoryFormDialog open={open} onOpenChange={setOpen} editing={editing} />
      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(v) => !v && setConfirmId(null)}
        title="Excluir essa memória?"
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => { if (confirmId) deleteMemory(confirmId); setConfirmId(null); }}
      />
      <ShareCard
        memory={shareMem}
        open={!!shareMem}
        onOpenChange={(v) => !v && setShareMem(null)}
        coupleNames={couple ? `${couple.name1} & ${couple.name2}` : undefined}
      />
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onIndexChange={(i) => setLightbox({ ...lightbox, index: i })}
        />
      )}
    </div>
  );
}
