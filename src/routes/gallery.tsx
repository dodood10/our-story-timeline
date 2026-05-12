import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { Lightbox } from "@/components/gallery/Lightbox";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Play } from "lucide-react";
import { formatDatePT } from "@/lib/dates";
import { parseISO } from "date-fns";
import { Photo } from "@/components/common/Photo";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Galeria — Memory Lane" },
      { name: "description", content: "Todas as fotos de vocês em um só lugar." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { memories } = useApp();
  const [lightbox, setLightbox] = useState<{ index: number; slideshow?: boolean } | null>(null);

  const allPhotos = useMemo(() => {
    return memories
      .slice()
      .sort((a, b) => +parseISO(b.date) - +parseISO(a.date))
      .flatMap((m) =>
        m.photos.map((src) => ({ src, title: m.title, date: formatDatePT(m.date) })),
      );
  }, [memories]);

  return (
    <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl flex items-center gap-2">
            <ImageIcon className="h-7 w-7 text-primary" /> Galeria
          </h1>
          <p className="text-muted-foreground mt-1">{allPhotos.length} fotos guardadas</p>
        </div>
        {allPhotos.length > 0 && (
          <Button onClick={() => setLightbox({ index: 0, slideshow: true })}>
            <Play className="h-4 w-4 mr-1.5" /> Slideshow
          </Button>
        )}
      </header>

      {allPhotos.length === 0 ? (
        <EmptyState
          title="Nenhuma foto ainda"
          description="Adicione fotos nas memórias para vê-las aqui."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {allPhotos.map((p, i) => (
            <button
              key={i}
              onClick={() => setLightbox({ index: i })}
              className="relative aspect-square overflow-hidden rounded-xl bg-muted group"
            >
              <Photo src={p.src} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                <p className="text-white text-xs font-medium truncate">{p.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <Lightbox
          photos={allPhotos}
          index={lightbox.index}
          initialSlideshow={lightbox.slideshow}
          onClose={() => setLightbox(null)}
          onIndexChange={(i) => setLightbox({ ...lightbox, index: i })}
        />
      )}
    </div>
  );
}
