import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { captureAffiliateFromSearch, writeAffiliateRef } from "@/lib/affiliate-attribution";
import { recordAffiliateClickFn, validateAffiliateCode } from "@/lib/affiliate.functions";
import { trackCustom } from "@/lib/meta-pixel";

/** Grava ref da URL (last-touch) e registra clique se afiliado ativo. */
export function AffiliateCapture({ refCode }: { refCode?: string }) {
  const validateFn = useServerFn(validateAffiliateCode);
  const clickFn = useServerFn(recordAffiliateClickFn);

  useEffect(() => {
    const code = captureAffiliateFromSearch(refCode);
    if (!code) return;

    let cancelled = false;
    (async () => {
      const result = await validateFn({ data: { code } });
      if (cancelled || !result.valid) return;
      writeAffiliateRef(result.code);
      trackCustom("AffiliateLanding", { ref: result.code });
      void clickFn({
        data: { code: result.code, path: window.location.pathname },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [refCode, validateFn, clickFn]);

  return null;
}
