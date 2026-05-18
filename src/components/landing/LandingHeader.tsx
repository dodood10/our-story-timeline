import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_NAME, BRAND_SHORT } from "@/lib/brand";
import { PROMO_BAR_HEIGHT } from "./PromoTimerBar";

export function LandingHeader() {
  return (
    <header
      className="sticky z-40 backdrop-blur bg-background/80 border-b border-border"
      style={{ top: PROMO_BAR_HEIGHT }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary fill-primary/20" strokeWidth={1.8} />
          <span className="font-display text-lg hidden sm:inline">{BRAND_NAME}</span>
          <span className="font-display text-lg sm:hidden">{BRAND_SHORT}</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#como-funciona" className="hover:text-foreground transition">
            Como funciona
          </a>
          <a href="#entregas" className="hover:text-foreground transition">
            Entregas
          </a>
          <a href="#precos" className="hover:text-foreground transition">
            Preços
          </a>
          <a href="#faq" className="hover:text-foreground transition">
            FAQ
          </a>
        </nav>
        <Button asChild size="sm">
          <Link to="/surprise" search={{ plan: "premium" }}>
            Começar
          </Link>
        </Button>
      </div>
    </header>
  );
}
