import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useCallback } from "react";
import { useApp } from "@/hooks/useApp";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { MemoryFormDialog } from "@/components/memories/MemoryFormDialog";
import { TimelineFilters, type EmotionFilter } from "@/components/memories/TimelineFilters";
import { Lightbox } from "@/components/gallery/Lightbox";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ShareCard } from "@/components/memories/ShareCard";
import { Plus, Clock } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
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
  const [emotion, setEmotion] = useState<EmotionFilter>("all");
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { openConfirm, dialogProps: deleteDialogProps } = useConfirmDelete(deleteMemory);
  const [shareMem, setShareMem] = useState<Memory | null>(null);
  const [lightbox, setLightbox] = useState<{ photos: { src: string; title: string; date: string }[]; index: number } | null>(null);

  const handleEdit = useCallback((m: Memory) => { setEditing(m); setOpen(true); }, []);
  const handleDelete = useCallback((id: string) => openConfirm(id), [openConfirm]);
  const handleToggleFavorite = useCallback((id: string) => toggleFavoriteMemory(id), [toggleFavoriteMemory]);
  const handleShare = useCallback((m: Memory) => setShareMem(m), []);
  const handlePhotoClick = useCallback((m: Memory, i: number) =>
    setLightbox({
      photos: m.photos.map((src) => ({ src, title: m.title, date: formatDatePT(m.date) })),
      index: i,
    }), []);

  const years = useMemo(
    () => Array.from(new Set(memories.map((m) => parseISO(m.date).getFullYear()))).sort((a, b) => b - a),
    [memories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pairs = memories.map((m) => [m, parseISO(m.date).getTime()] as const);
    return pairs
      .filter(([m, ts]) => {
        if (year !== "all" && String(new Date(ts).getFullYear()) !== year) return false;
        if (emotion !== "all" && m.emotion !== emotion) return false;
        if (favoritesOnly && !m.favorite) return false;
        if (q) {
          const hay = `${m.title} ${m.description ?? ""} ${m.location ?? ""} ${(m.tags ?? []).join(" ")}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort(([, a], [, b]) => b - a)
      .map(([m]) => m);
  }, [memories, year, emotion, favoritesOnly, query]);

  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      <PageHeader
        icon={Clock}
        title="Linha do Tempo"
        subtitle="Sua história, em ordem."
        className="mb-6"
        action={
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="hidden sm:inline-flex">
            <Plus className="h-4 w-4 mr-1" /> Nova memória
          </Button>
        }
      />

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
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
                onShare={handleShare}
                onPhotoClick={handlePhotoClick}
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
        {...deleteDialogProps}
        title="Excluir essa memória?"
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
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
