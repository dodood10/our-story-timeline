import { useState, useCallback } from "react";
import { compressImage } from "@/lib/storage";
import { toast } from "sonner";

export function useCouplePhoto(initial?: string) {
  const [photo, setPhoto] = useState<string | undefined>(initial);

  const onPhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setPhoto(await compressImage(f, 800, 0.85));
    } catch {
      toast.error("Não consegui processar a foto");
    }
  }, []);

  return { photo, setPhoto, onPhotoChange };
}
