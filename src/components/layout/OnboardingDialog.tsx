import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Camera, Calendar } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { compressImage } from "@/lib/storage";
import { seedBucket, seedLetters, seedMemories } from "@/lib/seed";
import type { RelationshipStatus } from "@/lib/types";
import { toast } from "sonner";

export function OnboardingDialog({ open }: { open: boolean }) {
  const { setCouple, setOnboarded, setMemories, setBucket, setLetters } = useAppHelpers();
  const [step, setStep] = useState(0);
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<RelationshipStatus>("dating");

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const compressed = await compressImage(f, 800, 0.85);
    setPhoto(compressed);
  }

  function finish() {
    if (!name1.trim() || !name2.trim()) {
      toast.error("Preencha os dois nomes");
      return;
    }
    setCouple({
      name1: name1.trim(),
      name2: name2.trim(),
      photo,
      startDate,
      status,
      createdAt: new Date().toISOString(),
    });
    setMemories(seedMemories());
    setBucket(seedBucket());
    setLetters(seedLetters());
    setOnboarded(true);
    toast.success("Bem-vindos ao Memory Lane 💕");
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-6 w-6 text-primary fill-primary/20" />
            <DialogTitle className="font-display text-2xl">Bem-vindos ao Memory Lane</DialogTitle>
          </div>
          <DialogDescription>
            Vamos guardar a história de vocês juntos. Leva menos de um minuto.
          </DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Como vocês se chamam?</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="Nome 1" value={name1} onChange={(e) => setName1(e.target.value)} />
                <Heart className="h-5 w-5 text-primary shrink-0" />
                <Input placeholder="Nome 2" value={name2} onChange={(e) => setName2(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setStep(1)} disabled={!name1.trim() || !name2.trim()}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Label>Foto do casal (opcional)</Label>
            <label className="flex items-center justify-center h-48 rounded-xl border-2 border-dashed border-border cursor-pointer hover:bg-muted/50 transition overflow-hidden">
              {photo ? (
                <img src={photo} alt="Casal" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="h-8 w-8" strokeWidth={1.5} />
                  <span className="text-sm">Clique para enviar uma foto</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </label>
            <div className="flex justify-between gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep(0)}>Voltar</Button>
              <Button onClick={() => setStep(2)}>Continuar</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quando começou essa história?</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={startDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RelationshipStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dating">Namorando</SelectItem>
                  <SelectItem value="engaged">Noivos</SelectItem>
                  <SelectItem value="married">Casados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
              <Button onClick={finish}>
                <Heart className="h-4 w-4 mr-1.5 fill-current" />
                Começar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Need access to setMemories/setBucket/setLetters too — extend helper
function useAppHelpers() {
  const ctx = useApp();
  return {
    ...ctx,
    setMemories: (m: import("@/lib/types").Memory[]) => {
      window.localStorage.setItem("ml.memories", JSON.stringify(m));
      // trigger reload via storage event or full refresh:
      window.dispatchEvent(new StorageEvent("storage", { key: "ml.memories", newValue: JSON.stringify(m) }));
    },
    setBucket: (m: import("@/lib/types").BucketItem[]) => {
      window.localStorage.setItem("ml.bucket", JSON.stringify(m));
      window.dispatchEvent(new StorageEvent("storage", { key: "ml.bucket", newValue: JSON.stringify(m) }));
    },
    setLetters: (m: import("@/lib/types").Letter[]) => {
      window.localStorage.setItem("ml.letters", JSON.stringify(m));
      window.dispatchEvent(new StorageEvent("storage", { key: "ml.letters", newValue: JSON.stringify(m) }));
    },
  };
}
