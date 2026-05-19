import { createFileRoute } from "@tanstack/react-router";
import { PromoTimerBar, PROMO_BAR_HEIGHT } from "@/components/landing/PromoTimerBar";
import { usePromoTimer } from "@/hooks/usePromoTimer";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { CuriositySection } from "@/components/landing/CuriositySection";
import { SceneSection } from "@/components/landing/SceneSection";
import { PlanPreviewSection } from "@/components/landing/PlanPreviewSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { DeliverablesSection } from "@/components/landing/DeliverablesSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { ObjectionSection } from "@/components/landing/ObjectionSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BRAND_NAME } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: BRAND_NAME,
      },
      {
        name: "description",
        content:
          "Plano para homens criarem uma surpresa emocionante no Dia dos Namorados. Quiz + plano personalizado: roteiro, decoração, lista de compras e frases prontas.",
      },
      { property: "og:title", content: BRAND_NAME },
      {
        property: "og:description",
        content:
          "Transforme uma noite comum em uma experiência inesquecível. Plano personalizado em minutos — acesso imediato.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { phase } = usePromoTimer();
  const barVisible = phase !== "expired";

  return (
    <div className="bg-background text-foreground">
      {barVisible && <PromoTimerBar />}
      <div style={{ paddingTop: barVisible ? PROMO_BAR_HEIGHT : "0" }}>
        <LandingHeader />
        <HeroSection />
        <PlanPreviewSection />
        <CuriositySection />
        <SceneSection />
        <ProblemSection />
        <DeliverablesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <TestimonialsSection />
        <ObjectionSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
        <LandingFooter />
      </div>
    </div>
  );
}
