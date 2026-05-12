import { useEffect, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Download, Play, Pause } from "lucide-react";
import { downloadDataUrl } from "@/lib/storage";

export interface LightboxPhoto {
  src: string;
  title?: string;
  date?: string;
}

export function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
  initialSlideshow,
}: {
  photos: LightboxPhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  initialSlideshow?: boolean;
}) {
  const [playing, setPlaying] = useState(!!initialSlideshow);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (playing) {
      timer.current = window.setInterval(() => {
        onIndexChange((index + 1) % photos.length);
      }, 3000);
    }
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [playing, index, photos.length, onIndexChange]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % photos.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + photos.length) % photos.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, onClose, onIndexChange]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white" aria-label="Fechar">
        <X className="h-5 w-5" />
      </button>
      <div className="absolute top-4 left-4 flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); setPlaying((p) => !p); }} className="h-10 px-3 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-white text-sm">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? "Pausar" : "Slideshow"}
        </button>
        <button onClick={(e) => { e.stopPropagation(); downloadDataUrl(photo.src, `memoria-${index + 1}.jpg`); }} className="h-10 px-3 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-white text-sm">
          <Download className="h-4 w-4" /> Baixar
        </button>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onIndexChange((index - 1 + photos.length) % photos.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onIndexChange((index + 1) % photos.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="max-w-[90vw] max-h-[80vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img src={photo.src} alt={photo.title ?? "Foto"} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl" />
        {(photo.title || photo.date) && (
          <div className="mt-4 text-center text-white">
            {photo.title && <p className="font-display text-lg">{photo.title}</p>}
            {photo.date && <p className="text-sm text-white/70">{photo.date}</p>}
          </div>
        )}
        <p className="mt-2 text-xs text-white/60">{index + 1} / {photos.length}</p>
      </div>
    </div>
  );
}
