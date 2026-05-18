import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { deletePhoto, isPhotoRef, savePhotoFile } from "@/lib/photos";
import { toast } from "sonner";
import { Photo } from "@/components/common/Photo";

export function PhotoUploader({
  photos,
  onChange,
  max = 5,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = max - photos.length;
    if (remaining <= 0) {
      toast.error(`Máximo de ${max} fotos`);
      return;
    }
    const list = Array.from(files).slice(0, remaining);
    const refs: string[] = [];
    for (const f of list) {
      try {
        refs.push(await savePhotoFile(f));
      } catch {
        toast.error("Não consegui salvar uma foto");
      }
    }
    onChange([...photos, ...refs]);
  }

  function remove(i: number) {
    const ref = photos[i];
    if (ref && isPhotoRef(ref)) void deletePhoto(ref);
    onChange(photos.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {photos.map((p, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
            <Photo src={p} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              aria-label="Remover foto"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {photos.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition gap-1"
          >
            <Camera className="h-5 w-5" />
            <span className="text-[10px]">Adicionar</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="text-xs text-muted-foreground">
        {photos.length}/{max} fotos
      </p>
    </div>
  );
}
