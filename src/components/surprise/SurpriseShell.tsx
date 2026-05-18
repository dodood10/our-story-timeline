import { useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { shouldShowFunnelPromoTimer, PROMO_BAR_HEIGHT } from "@/lib/promo-timer";
import { PromoTimerBar } from "@/components/landing/PromoTimerBar";
import { usePromoTimer } from "@/hooks/usePromoTimer";
import { TrustFooter } from "@/components/checkout/TrustFooter";
import { SurpriseFunnelHeader } from "./SurpriseFunnelHeader";

interface SurpriseShellProps {
  children: React.ReactNode;
  footer?: boolean;
  /** Override route-based timer visibility (checkout + upsell only by default). */
  showTimer?: boolean;
  showHeaderCta?: boolean;
  className?: string;
  mainClassName?: string;
}

export function SurpriseShell({
  children,
  footer = false,
  showTimer,
  showHeaderCta = false,
  className,
  mainClassName,
}: SurpriseShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { phase } = usePromoTimer();
  const timerVisible = phase !== "expired" && (showTimer ?? shouldShowFunnelPromoTimer(pathname));
  const topOffset = timerVisible ? PROMO_BAR_HEIGHT : "0px";

  return (
    <div className={cn("min-h-screen bg-gradient-soft flex flex-col", className)}>
      {timerVisible && <PromoTimerBar />}
      <div style={{ paddingTop: topOffset }} className="flex flex-col flex-1">
        <SurpriseFunnelHeader showCta={showHeaderCta} stickyTop={topOffset} />
        <main className={cn("flex-1 w-full", mainClassName)}>{children}</main>
        {footer && <TrustFooter />}
      </div>
    </div>
  );
}
