import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import type { Memory } from "@/lib/types";
import { EMOTIONS } from "@/lib/types";
import { formatDatePT } from "@/lib/dates";
import { resolvePhoto, isPhotoRef } from "@/lib/photos";
import { downloadDataUrl } from "@/lib/storage";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export function ShareCard({
  memory,
  open,
  onOpenChange,
  coupleNames,
}: {
  memory: Memory | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  coupleNames?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");

  useEffect(() => {
    let alive = true;
    const first = memory?.photos?.[0];
    if (!first) {
      setPhotoUrl("");
      return;
    }
    (isPhotoRef(first) ? resolvePhoto(first) : Promise.resolve(first)).then((u) => {
      if (alive) setPhotoUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [memory]);

  if (!memory) return null;
  const emo = EMOTIONS.find((e) => e.id === memory.emotion);

  async function generate(): Promise<string | null> {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    return canvas.toDataURL("image/png");
  }

  async function download() {
    const url = await generate();
    if (url) {
      downloadDataUrl(url, `memory-${memory!.id}.png`);
      toast.success("Cartão baixado 💕");
    }
  }

  async function share() {
    const url = await generate();
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], `memory-${memory!.id}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: memory!.title });
      } else {
        downloadDataUrl(url, `memory-${memory!.id}.png`);
        toast.success("Cartão baixado para compartilhar");
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Compartilhar memória</DialogTitle>
        </DialogHeader>

        <div className="overflow-hidden rounded-2xl">
          <div
            ref={cardRef}
            className="aspect-[9/16] w-full relative flex flex-col justify-end p-6 text-white"
            style={{
              background: photoUrl
                ? `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.85) 100%), url(${photoUrl}) center/cover`
                : "linear-gradient(135deg, oklch(0.78 0.16 0), oklch(0.78 0.13 320))",
            }}
          >
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs uppercase tracking-widest text-white/80">
              <span>Memory Lane</span>
              {coupleNames && <span>{coupleNames}</span>}
            </div>
            <div className="text-5xl mb-2">{emo?.emoji}</div>
            <h3 className="font-display text-3xl leading-tight mb-1">{memory.title}</h3>
            <p className="text-sm text-white/80">{formatDatePT(memory.date)}</p>
            {memory.location && <p className="text-xs text-white/70 mt-1">📍 {memory.location}</p>}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={download}>
            <Download className="h-4 w-4 mr-1.5" /> Baixar
          </Button>
          <Button onClick={share}>
            <Share2 className="h-4 w-4 mr-1.5" /> Compartilhar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
