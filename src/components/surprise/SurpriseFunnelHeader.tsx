import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_NAME, BRAND_SHORT } from "@/lib/brand";
import { PROMO_BAR_HEIGHT } from "@/components/landing/PromoTimerBar";

interface SurpriseFunnelHeaderProps {
  showCta?: boolean;
  /** Offset top when promo timer is hidden */
  stickyTop?: string;
}

export function SurpriseFunnelHeader({
  showCta = false,
  stickyTop = PROMO_BAR_HEIGHT,
}: SurpriseFunnelHeaderProps) {
  return (
    <header
      className="sticky z-40 backdrop-blur bg-background/80 border-b border-border"
      style={{ top: stickyTop }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <Heart className="h-5 w-5 text-primary fill-primary/20 shrink-0" strokeWidth={1.8} />
          <span className="font-display text-lg truncate hidden sm:inline">{BRAND_NAME}</span>
          <span className="font-display text-lg sm:hidden">{BRAND_SHORT}</span>
        </Link>
        {showCta && (
          <Button asChild size="sm" className="shrink-0">
            <Link to="/surprise" search={{ plan: "premium" }}>
              Ver planos
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
