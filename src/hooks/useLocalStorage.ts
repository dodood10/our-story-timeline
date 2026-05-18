import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function notifyStorageError() {
  toast.error("Não foi possível salvar no dispositivo. Libere espaço e tente de novo.");
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupt read */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      notifyStorageError();
    }
  }, [key, value, hydrated]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== key || e.newValue == null) return;
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const update = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);
  return [value, update, hydrated] as const;
}
