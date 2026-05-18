import { createFileRoute } from "@tanstack/react-router";
import { PromoTimerBar, PROMO_BAR_HEIGHT } from "@/components/landing/PromoTimerBar";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBadgesSection } from "@/components/landing/TrustBadgesSection";
import { SceneSection } from "@/components/landing/SceneSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { DeliverablesSection } from "@/components/landing/DeliverablesSection";
import { QualificationSection } from "@/components/landing/QualificationSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { WhyCheapSection } from "@/components/landing/WhyCheapSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Método Surpresa Perfeita™ — Dia dos Namorados 2026",
      },
      {
        name: "description",
        content:
          "Plano personalizado com decoração, lista de compras, roteiro e frases prontas. Quiz rápido + IA. Surpreenda em casa gastando pouco.",
      },
      { property: "og:title", content: "Método Surpresa Perfeita™ — Dia dos Namorados 2026" },
      {
        property: "og:description",
        content:
          "Método completo para uma noite inesquecível em casa. Acesso imediato após o pagamento.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <PromoTimerBar />
      <div style={{ paddingTop: PROMO_BAR_HEIGHT }}>
        <LandingHeader />
        <HeroSection />
        <TrustBadgesSection />
        <SceneSection />
        <ProblemSection />
        <HowItWorksSection />
        <DeliverablesSection />
        <QualificationSection />
        <TestimonialsSection />
        <WhyCheapSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
        <LandingFooter />
      </div>
    </div>
  );
}
