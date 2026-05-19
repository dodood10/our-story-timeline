import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KEY_FULL } from "@/lib/access-purchase";
import { parseSubscription } from "@/lib/memory-lane-subscription";
import { migrateLocalEntitlements } from "@/lib/entitlements.functions";
import { toast } from "sonner";

const IMPORTED_KEY = "ml.auth.local-imported";

export function readLocalImportDone(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(IMPORTED_KEY) === "1";
}

export function markLocalImportDone(): void {
  window.localStorage.setItem(IMPORTED_KEY, "1");
}

function readLocalSubscriptionForImport(): ReturnType<typeof parseSubscription> {
  try {
    const raw = window.localStorage.getItem(KEY_FULL);
    if (raw) return parseSubscription(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return null;
}

export function ImportLocalEntitlementsDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function importNow() {
    const subscription = readLocalSubscriptionForImport();
    if (!subscription) {
      markLocalImportDone();
      onOpenChange(false);
      return;
    }
    setBusy(true);
    try {
      await migrateLocalEntitlements({ data: { subscription } });
      markLocalImportDone();
      toast.success("Assinatura Memory Lane importada para sua conta.");
      onImported();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao importar");
    } finally {
      setBusy(false);
    }
  }

  function skip() {
    markLocalImportDone();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar acesso deste dispositivo?</DialogTitle>
          <DialogDescription>
            Encontramos compras ou assinatura salvas localmente neste navegador. Deseja vinculá-las
            à sua conta na nuvem?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={skip} disabled={busy}>
            Agora não
          </Button>
          <Button onClick={importNow} disabled={busy}>
            {busy ? "Importando..." : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
