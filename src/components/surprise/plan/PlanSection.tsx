import type { LucideIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface PlanSectionProps {
  id: string;
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function PlanSection({
  id,
  icon: Icon,
  title,
  children,
  defaultOpen = true,
  className,
}: PlanSectionProps) {
  return (
    <section
      className={cn("border-t border-border/60 pt-6 first:border-t-0 first:pt-0", className)}
    >
      <div className="hidden sm:block">
        <h2 className="font-display text-xl sm:text-2xl flex items-center gap-2 mb-4">
          <Icon className="h-5 w-5 text-primary shrink-0" />
          {title}
        </h2>
        {children}
      </div>
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpen ? id : undefined}
        className="sm:hidden"
      >
        <AccordionItem value={id} className="border-none">
          <AccordionTrigger className="font-display text-xl py-2 hover:no-underline">
            <span className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary shrink-0" />
              {title}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
