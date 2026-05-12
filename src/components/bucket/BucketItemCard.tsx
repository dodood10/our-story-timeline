import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Trash2, Camera } from "lucide-react";
import type { BucketItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/storage";

export function BucketItemCard({
  item,
  onToggle,
  onDelete,
  onPhoto,
}: {
  item: BucketItem;
  onToggle: () => void;
  onDelete: () => void;
  onPhoto: (photo: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const c = await compressImage(f);
      onPhoto(c);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group p-4 rounded-2xl border bg-card transition-all hover:shadow-card ${item.done ? "opacity-90" : ""}`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`shrink-0 h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all ${
            item.done
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border hover:border-primary"
          }`}
          aria-label={item.done ? "Desmarcar" : "Marcar como realizado"}
        >
          {item.done && <Check className="h-5 w-5" />}
        </button>
        <p className={`flex-1 ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.title}</p>
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive p-1.5">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {item.done && (
        <div className="mt-3 pl-13 ml-13 space-y-2">
          {item.photo ? (
            <img src={item.photo} alt={item.title} className="rounded-lg max-h-48 w-full object-cover" />
          ) : (
            <label className="inline-flex items-center gap-2 text-xs text-primary hover:underline cursor-pointer">
              <Camera className="h-3.5 w-3.5" />
              {uploading ? "Enviando..." : "Adicionar foto desse momento"}
              <input type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
            </label>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function BucketAddInline({ onAdd }: { onAdd: (title: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!val.trim()) return;
        onAdd(val.trim());
        setVal("");
      }}
      className="flex gap-2"
    >
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Adicionar novo sonho..."
        className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm"
      />
      <Button type="submit">Adicionar</Button>
    </form>
  );
}
