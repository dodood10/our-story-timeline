import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { toast } from "sonner";
import type { Letter } from "@/lib/types";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export function LetterFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Letter | null;
}) {
  const { addLetter } = useApp();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [confirmSeal, setConfirmSeal] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title);
        setMessage(editing.message);
        setUnlockDate(editing.unlockDate ?? "");
      } else {
        setTitle("");
        setMessage("");
        setUnlockDate("");
      }
    }
  }, [open, editing]);

  function saveDraft() {
    if (!title.trim() || !message.trim()) return toast.error("Preencha título e mensagem");
    addLetter({ title: title.trim(), message: message.trim(), unlockDate: unlockDate || undefined });
    toast.success("Carta salva como rascunho");
    onOpenChange(false);
  }

  function seal() {
    if (!title.trim() || !message.trim()) return toast.error("Preencha título e mensagem");
    setConfirmSeal(true);
  }

  function doSeal() {
    addLetter({ title: title.trim(), message: message.trim(), unlockDate: unlockDate || undefined, sealed: true });
    toast.success("Carta lacrada com carinho 💌");
    setConfirmSeal(false);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Nova carta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quando abrir / Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Abra quando estiver triste 💙" />
            </div>
            <div className="space-y-2">
              <Label>Data específica (opcional)</Label>
              <Input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escreva uma mensagem carinhosa..." />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button variant="outline" onClick={saveDraft}>Salvar rascunho</Button>
            <Button onClick={seal}>
              <Lock className="h-4 w-4 mr-1.5" /> Lacrar carta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmSeal}
        onOpenChange={setConfirmSeal}
        title="Lacrar essa carta?"
        description="Depois de lacrada, ela não poderá mais ser editada. Vai virar uma surpresa."
        confirmLabel="Sim, lacrar"
        onConfirm={doSeal}
      />
    </>
  );
}
