import { motion } from "framer-motion";
import { MoreVertical, MapPin, Pencil, Trash2 } from "lucide-react";
import type { Memory } from "@/lib/types";
import { EMOTIONS } from "@/lib/types";
import { formatDatePT } from "@/lib/dates";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MemoryCard({
  memory,
  onEdit,
  onDelete,
  onPhotoClick,
}: {
  memory: Memory;
  onEdit: () => void;
  onDelete: () => void;
  onPhotoClick?: (idx: number) => void;
}) {
  const emo = EMOTIONS.find((e) => e.id === memory.emotion);
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
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
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-muted">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Pencil className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {memory.description && (
          <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap mb-3">{memory.description}</p>
        )}
        {memory.location && (
          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3" /> {memory.location}
          </div>
        )}
      </div>
      {memory.photos.length > 0 && (
        <div className={`grid gap-1 ${memory.photos.length === 1 ? "grid-cols-1" : memory.photos.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {memory.photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPhotoClick?.(i)}
              className="relative aspect-[4/3] overflow-hidden bg-muted"
            >
              <img src={src} alt={`${memory.title} - foto ${i + 1}`} className="h-full w-full object-cover transition-transform hover:scale-105" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </motion.article>
  );
}
