import { motion } from "framer-motion";
import { Mail, Lock, Calendar } from "lucide-react";
import type { Letter } from "@/lib/types";
import { formatShortPT } from "@/lib/dates";
import { parseISO } from "date-fns";

export function isLetterUnlockable(letter: Letter, ref: Date = new Date()): boolean {
  if (!letter.sealed) return true;
  if (!letter.unlockDate) return false;
  return ref >= parseISO(letter.unlockDate);
}

export function LetterEnvelope({
  letter,
  opened,
  onClick,
}: {
  letter: Letter;
  opened: boolean;
  onClick: () => void;
}) {
  const unlockable = isLetterUnlockable(letter);
  return (
    <motion.button
      whileHover={unlockable ? { y: -4 } : undefined}
      onClick={onClick}
      disabled={!unlockable}
      className={`relative aspect-[5/3] w-full rounded-xl border-2 p-5 text-left transition-all ${
        opened
          ? "bg-card border-primary/40"
          : unlockable
            ? "bg-gradient-romantic border-primary/30 hover:shadow-soft"
            : "bg-muted border-border opacity-70 cursor-not-allowed"
      }`}
    >
      <div className="absolute top-3 right-3">
        {!unlockable ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : opened ? (
          <Mail className="h-4 w-4 text-primary" />
        ) : (
          <Mail className="h-4 w-4 text-primary fill-primary/20" />
        )}
      </div>
      <p className="font-display text-lg leading-tight pr-8">{letter.title}</p>
      <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between text-xs text-muted-foreground">
        {letter.unlockDate ? (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {formatShortPT(letter.unlockDate)}
          </span>
        ) : (
          <span>Quando precisar</span>
        )}
        <span>{opened ? "Aberta" : letter.sealed ? "Lacrada" : "Rascunho"}</span>
      </div>
    </motion.button>
  );
}
