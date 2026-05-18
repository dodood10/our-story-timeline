import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/lib/landing-content";

export function FaqSection() {
  return (
    <section id="faq" className="py-16 sm:py-24 scroll-mt-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl text-center">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqItems.map((it, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{it.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
