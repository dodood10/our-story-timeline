import { useState, useCallback } from "react";

export function useConfirmDelete(deleteFn: (id: string) => void) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const openConfirm = useCallback((id: string) => setConfirmId(id), []);

  const dialogProps = {
    open: !!confirmId,
    onOpenChange: (v: boolean) => { if (!v) setConfirmId(null); },
    onConfirm: () => {
      if (confirmId) {
        deleteFn(confirmId);
        setConfirmId(null);
      }
    },
  };

  return { openConfirm, dialogProps };
}
