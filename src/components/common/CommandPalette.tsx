import { useEffect, useState, useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from "@tanstack/react-router";
import { useApp } from "@/hooks/useApp";
import { NAV_ITEMS } from "@/components/layout/AppSidebar";
import { Heart, Plus } from "lucide-react";
import { formatDatePT } from "@/lib/dates";

export function CommandPalette({
  open,
  onOpenChange,
  onNewMemory,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNewMemory?: () => void;
}) {
  const navigate = useNavigate();
  const { memories, bucket, letters } = useApp();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const items = useMemo(() => memories.slice(0, 50), [memories]);

  function go(to: string) {
    onOpenChange(false);
    navigate({ to });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar memórias, páginas..." value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        <CommandGroup heading="Ações">
          {onNewMemory && (
            <CommandItem
              onSelect={() => {
                onOpenChange(false);
                onNewMemory();
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Nova memória
            </CommandItem>
          )}
        </CommandGroup>
        <CommandGroup heading="Navegar">
          {NAV_ITEMS.map((n) => (
            <CommandItem key={n.to} value={`nav ${n.label}`} onSelect={() => go(n.to)}>
              <span className="mr-2">{n.emoji}</span> {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {items.length > 0 && (
          <CommandGroup heading="Memórias">
            {items.map((m) => (
              <CommandItem
                key={m.id}
                value={`mem ${m.title} ${m.location ?? ""} ${(m.tags ?? []).join(" ")} ${m.description}`}
                onSelect={() => go("/timeline")}
              >
                <Heart className="h-3 w-3 mr-2 text-primary" />
                <span className="flex-1 truncate">{m.title}</span>
                <span className="text-xs text-muted-foreground ml-2">{formatDatePT(m.date)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {bucket.length > 0 && (
          <CommandGroup heading="Bucket list">
            {bucket.slice(0, 20).map((b) => (
              <CommandItem
                key={b.id}
                value={`bucket ${b.title}`}
                onSelect={() => go("/bucket-list")}
              >
                {b.done ? "✅" : "🎯"} <span className="ml-2">{b.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {letters.length > 0 && (
          <CommandGroup heading="Cartas">
            {letters.slice(0, 20).map((l) => (
              <CommandItem key={l.id} value={`letter ${l.title}`} onSelect={() => go("/letters")}>
                💌 <span className="ml-2">{l.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function useCmdK(setOpen: (v: boolean) => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}
