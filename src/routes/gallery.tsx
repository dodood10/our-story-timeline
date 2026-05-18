import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { Lightbox } from "@/components/gallery/Lightbox";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
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

const PAGE_SIZE = 24;

function GalleryPage() {
  const { memories } = useApp();
  const [lightbox, setLightbox] = useState<{ index: number; slideshow?: boolean } | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const allPhotos = useMemo(() => {
    return memories
      .slice()
      .sort((a, b) => +parseISO(b.date) - +parseISO(a.date))
      .flatMap((m) => m.photos.map((src) => ({ src, title: m.title, date: formatDatePT(m.date) })));
  }, [memories]);

  return (
    <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
      <PageHeader
        icon={ImageIcon}
        title="Galeria"
        subtitle={`${allPhotos.length} fotos guardadas`}
        className="mb-6"
        action={
          allPhotos.length > 0 ? (
            <Button onClick={() => setLightbox({ index: 0, slideshow: true })}>
              <Play className="h-4 w-4 mr-1.5" /> Slideshow
            </Button>
          ) : undefined
        }
      />

      {allPhotos.length === 0 ? (
        <EmptyState
          title="Nenhuma foto ainda"
          description="Adicione fotos nas memórias para vê-las aqui."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {allPhotos.slice(0, visible).map((p, i) => (
              <button
                key={i}
                type="button"
                aria-label={p.title ? `Abrir ${p.title}` : `Abrir foto ${i + 1}`}
                onClick={() => setLightbox({ index: i })}
                className="relative aspect-square overflow-hidden rounded-xl bg-muted group"
              >
                <Photo
                  src={p.src}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                  <p className="text-white text-xs font-medium truncate">{p.title}</p>
                </div>
              </button>
            ))}
          </div>
          {visible < allPhotos.length && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Carregar mais ({allPhotos.length - visible} restantes)
              </Button>
            </div>
          )}
        </>
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
