import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LetterEnvelope, isLetterUnlockable } from "@/components/letters/LetterEnvelope";
import { LetterReader } from "@/components/letters/LetterReader";
import { LetterFormDialog } from "@/components/letters/LetterFormDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import type { Letter } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/letters")({
  head: () => ({
    meta: [
      { title: "Cartas — Memory Lane" },
      { name: "description", content: 'Cartas "Abra quando…" para o seu amor.' },
    ],
  }),
  component: LettersPage,
});

function LettersPage() {
  const { letters, openLetter, deleteLetter } = useApp();
  const [reading, setReading] = useState<Letter | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function onClickEnvelope(l: Letter) {
    if (!isLetterUnlockable(l)) {
      toast.message("Essa carta ainda está lacrada", { description: "Aguarde a data certa para abri-la 💌" });
      return;
    }
    openLetter(l.id);
    setReading(l);
  }

  return (
    <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl flex items-center gap-2">
            <Mail className="h-7 w-7 text-primary" /> Cartas
          </h1>
          <p className="text-muted-foreground mt-1">"Abra quando..." — pequenos abraços guardados.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nova carta
        </Button>
      </header>

      {letters.length === 0 ? (
        <EmptyState
          title="Sem cartas ainda"
          description="Escreva mensagens carinhosas para serem abertas em momentos especiais."
          action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-1" /> Escrever carta</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {letters.map((l) => (
            <div key={l.id} className="space-y-1">
              <LetterEnvelope letter={l} opened={!!l.openedAt} onClick={() => onClickEnvelope(l)} />
              <button
                onClick={() => setConfirmId(l.id)}
                className="text-[11px] text-muted-foreground hover:text-destructive ml-1"
              >
                excluir
              </button>
            </div>
          ))}
        </div>
      )}

      <LetterFormDialog open={creating} onOpenChange={setCreating} />
      <LetterReader letter={reading} onClose={() => setReading(null)} />
      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(v) => !v && setConfirmId(null)}
        title="Excluir essa carta?"
        confirmLabel="Excluir"
        destructive
        onConfirm={() => { if (confirmId) deleteLetter(confirmId); setConfirmId(null); }}
      />
    </div>
  );
}
