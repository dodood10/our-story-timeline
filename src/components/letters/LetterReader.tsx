import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Mail } from "lucide-react";
import type { Letter } from "@/lib/types";
import { formatDatePT } from "@/lib/dates";

export function LetterReader({
  letter,
  onClose,
}: {
  letter: Letter | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!letter} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <AnimatePresence mode="wait">
          {letter && (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, scale: 0.9, rotateX: -20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-primary">
                <Mail className="h-5 w-5 fill-primary/20" />
                <p className="font-display text-2xl">{letter.title}</p>
              </div>
              <div className="rounded-2xl bg-gradient-soft p-6 border border-primary/20 shadow-soft">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap font-display text-lg">
                  {letter.message}
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-right italic">
                Escrita em {formatDatePT(letter.createdAt)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
