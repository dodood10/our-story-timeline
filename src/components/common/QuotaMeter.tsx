import { useEffect, useState } from "react";
import { storageEstimate } from "@/lib/photos";
import { estimateStorageBytes } from "@/lib/storage";
import { HardDrive } from "lucide-react";

export function QuotaMeter() {
  const [info, setInfo] = useState<{ used: number; quota: number } | null>(null);

  useEffect(() => {
    storageEstimate()
      .then((e) => {
        if (e?.quota) { setInfo(e); return; }
        const used = estimateStorageBytes();
        setInfo({ used, quota: Math.max(used * 2, 5 * 1024 * 1024) });
      })
      .catch(() => {
        const used = estimateStorageBytes();
        setInfo({ used, quota: Math.max(used * 2, 5 * 1024 * 1024) });
      });
  }, []);

  if (!info) return null;
  const usedMb = info.used / 1024 / 1024;
  const quotaMb = info.quota / 1024 / 1024;
  const pct = Math.min(100, (info.used / info.quota) * 100);
  const warning = pct > 70;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <HardDrive className="h-3.5 w-3.5" /> Armazenamento
        </span>
        <span className={warning ? "text-destructive font-medium" : "text-muted-foreground"}>
          {usedMb.toFixed(1)} MB / {quotaMb.toFixed(0)} MB
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full transition-all ${warning ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {warning && (
        <p className="text-xs text-destructive">
          Espaço quase esgotado. Faça um backup e considere remover fotos antigas.
        </p>
      )}
    </div>
  );
}
