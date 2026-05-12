import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmotionPicker } from "./EmotionPicker";
import { PhotoUploader } from "./PhotoUploader";
import { TagInput } from "@/components/common/TagInput";
import { Heart, MapPin } from "lucide-react";
import type { Memory, Emotion } from "@/lib/types";
import { useApp } from "@/hooks/useApp";
import { celebrate } from "@/lib/confetti";
import { toast } from "sonner";

export function MemoryFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Memory | null;
}) {
  const { addMemory, updateMemory, memories } = useApp();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [emotion, setEmotion] = useState<Emotion | undefined>("love");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const tagSuggestions = useMemo(() => {
    const all = new Set<string>();
    memories.forEach((m) => m.tags?.forEach((t) => all.add(t)));
    return Array.from(all);
  }, [memories]);

  useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title);
        setDate(editing.date);
        setDescription(editing.description);
        setPhotos(editing.photos);
        setEmotion(editing.emotion);
        setLocation(editing.location ?? "");
        setTags(editing.tags ?? []);
      } else {
        setTitle("");
        setDate(new Date().toISOString().slice(0, 10));
        setDescription("");
        setPhotos([]);
        setEmotion("love");
        setLocation("");
        setTags([]);
      }
    }
  }, [open, editing]);

  function save() {
    if (!title.trim()) return toast.error("Dê um título à memória");
    if (!emotion) return toast.error("Escolha uma emoção");
    const payload = {
      title: title.trim(),
      date,
      description: description.trim(),
      photos,
      emotion,
      location: location.trim() || undefined,
      tags: tags.length ? tags : undefined,
    };
    if (editing) {
      updateMemory(editing.id, payload);
      toast.success("Memória atualizada 💕");
    } else {
      addMemory(payload);
      celebrate();
      toast.success("Memória guardada 💕");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary/20" />
            {editing ? "Editar memória" : "Nova memória"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Primeira viagem juntos" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Localização (opcional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lugar especial" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Como vocês se sentiram?</Label>
            <EmotionPicker value={emotion} onChange={setEmotion} />
          </div>
          <div className="space-y-2">
            <Label>Conte essa história</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Descreva esse momento..." />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput value={tags} onChange={setTags} suggestions={tagSuggestions} />
          </div>
          <div className="space-y-2">
            <Label>Fotos</Label>
            <PhotoUploader photos={photos} onChange={setPhotos} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save}>
            <Heart className="h-4 w-4 mr-1.5 fill-current" />
            {editing ? "Salvar" : "Salvar memória"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
