import { cn } from "@/lib/utils";
import { PromoTimerBar, PROMO_BAR_HEIGHT } from "@/components/landing/PromoTimerBar";
import { TrustFooter } from "@/components/checkout/TrustFooter";
import { SurpriseFunnelHeader } from "./SurpriseFunnelHeader";

interface SurpriseShellProps {
  children: React.ReactNode;
  footer?: boolean;
  showTimer?: boolean;
  showHeaderCta?: boolean;
  className?: string;
  mainClassName?: string;
}

export function SurpriseShell({
  children,
  footer = false,
  showTimer = true,
  showHeaderCta = false,
  className,
  mainClassName,
}: SurpriseShellProps) {
  const topOffset = showTimer ? PROMO_BAR_HEIGHT : "0px";

  return (
    <div className={cn("min-h-screen bg-gradient-soft flex flex-col", className)}>
      {showTimer && <PromoTimerBar />}
      <div style={{ paddingTop: topOffset }} className="flex flex-col flex-1">
        <SurpriseFunnelHeader showCta={showHeaderCta} stickyTop={topOffset} />
        <main className={cn("flex-1 w-full", mainClassName)}>{children}</main>
        {footer && <TrustFooter />}
      </div>
    </div>
  );
}
