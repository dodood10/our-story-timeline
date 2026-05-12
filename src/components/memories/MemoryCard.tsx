import { motion } from "framer-motion";
import { MoreVertical, MapPin, Pencil, Trash2, Heart, Share2 } from "lucide-react";
import type { Memory } from "@/lib/types";
import { EMOTIONS } from "@/lib/types";
import { formatDatePT } from "@/lib/dates";
import { Photo } from "@/components/common/Photo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function MemoryCard({
  memory,
  onEdit,
  onDelete,
  onPhotoClick,
  onToggleFavorite,
  onShare,
}: {
  memory: Memory;
  onEdit: () => void;
  onDelete: () => void;
  onPhotoClick?: (idx: number) => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
}) {
  const emo = EMOTIONS.find((e) => e.id === memory.emotion);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group bg-card rounded-2xl shadow-card hover:shadow-soft border border-border overflow-hidden transition-shadow"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
              {emo?.emoji}
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-xl truncate">{memory.title}</h3>
              <p className="text-xs text-muted-foreground">{formatDatePT(memory.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                aria-label={memory.favorite ? "Remover dos favoritos" : "Favoritar"}
                className="p-1.5 rounded-md hover:bg-muted transition active:scale-90"
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition",
                    memory.favorite ? "text-primary fill-primary" : "text-muted-foreground",
                  )}
                />
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-muted">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onShare && (
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 className="h-4 w-4 mr-2" /> Compartilhar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {memory.description && (
          <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap mb-3">
            {memory.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {memory.location && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {memory.location}
            </span>
          )}
          {memory.tags?.map((t) => (
            <span key={t} className="text-[11px] rounded-full bg-secondary text-secondary-foreground px-2 py-0.5">
              #{t}
            </span>
          ))}
        </div>
      </div>
      {memory.photos.length > 0 && (
        <div
          className={`grid gap-1 ${
            memory.photos.length === 1 ? "grid-cols-1" : memory.photos.length === 2 ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {memory.photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPhotoClick?.(i)}
              className="relative aspect-[4/3] overflow-hidden bg-muted"
            >
              <Photo
                src={src}
                alt={`${memory.title} - foto ${i + 1}`}
                className="h-full w-full object-cover transition-transform hover:scale-105"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </motion.article>
  );
}
