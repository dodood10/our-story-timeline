import { usePromoTimer } from "@/hooks/usePromoTimer";
import { PROMO_BAR_HEIGHT } from "@/lib/promo-timer";

export { PROMO_BAR_HEIGHT };

export function PromoTimerBar() {
  const { display, phase } = usePromoTimer();

  const label =
    phase === "lastChance"
      ? "ÚLTIMA CHANCE — promoção expira em:"
      : phase === "expired"
        ? "Promoção encerrada — garanta seu plano antes do Dia dos Namorados"
        : "PROMOÇÃO DIA DOS NAMORADOS EXPIRA EM:";

  return (
    <div
      role="banner"
      className="fixed top-0 inset-x-0 z-50 h-10 flex items-center justify-center bg-primary text-primary-foreground text-xs sm:text-sm font-medium px-3 text-center"
    >
      <span className="truncate sm:whitespace-normal">
        ⏰ {label}{" "}
        {phase !== "expired" && (
          <span className="font-mono font-bold tabular-nums ml-1">{display}</span>
        )}
      </span>
    </div>
  );
}
