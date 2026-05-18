import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { TIMELINE_SLOT_LABELS, type SurprisePlan } from "@/lib/surprise-types";
import { PlanSection } from "./PlanSection";
import { PLAN_COPY } from "./plan-copy";

interface PlanTimelineProps {
  timeline: SurprisePlan["timeline"];
}

export function PlanTimeline({ timeline }: PlanTimelineProps) {
  return (
    <PlanSection id="timeline" icon={Clock} title={PLAN_COPY.timeline}>
      <ol className="relative mt-2 space-y-0 pl-1">
        <div
          className="absolute left-[52px] sm:left-[58px] top-3 bottom-3 w-px bg-primary/25"
          aria-hidden
        />
        {timeline.map((step, i) => (
          <motion.li
            key={step.slot}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="flex gap-3 sm:gap-4 items-start py-3 relative"
          >
            <span className="shrink-0 w-[88px] sm:w-[100px] px-2 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] sm:text-xs font-semibold text-center leading-tight z-10">
              {TIMELINE_SLOT_LABELS[step.slot]}
            </span>
            <span className="text-sm pt-1 leading-relaxed">{step.task}</span>
          </motion.li>
        ))}
      </ol>
    </PlanSection>
  );
}
