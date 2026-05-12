import { differenceInCalendarDays, addDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function daysTogether(startDate: string, ref: Date = new Date()): number {
  return Math.max(0, differenceInCalendarDays(ref, parseISO(startDate)));
}

const MILESTONE_DAYS = [30, 100, 180, 365, 500, 730, 1000, 1500, 2000, 3000, 4000, 5000];

export interface UpcomingMilestone {
  label: string;
  date: Date;
  daysLeft: number;
}

export function upcomingMilestones(startDate: string, ref: Date = new Date()): UpcomingMilestone[] {
  const start = parseISO(startDate);
  const elapsed = daysTogether(startDate, ref);
  const items: UpcomingMilestone[] = [];

  // day-count milestones
  for (const d of MILESTONE_DAYS) {
    if (d > elapsed) {
      items.push({
        label: dayLabel(d),
        date: addDays(start, d),
        daysLeft: d - elapsed,
      });
    }
  }
  // anniversary milestones (next yearly)
  for (let years = 1; years <= 10; years++) {
    const target = addDays(start, years * 365);
    const left = differenceInCalendarDays(target, ref);
    if (left > 0) {
      items.push({
        label: `${years} ${years === 1 ? "ano" : "anos"} juntos 💕`,
        date: target,
        daysLeft: left,
      });
    }
  }
  return items.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4);
}

function dayLabel(d: number): string {
  if (d === 365) return "1 ano juntos 💕";
  if (d === 730) return "2 anos juntos 💞";
  if (d === 1000) return "1000 dias juntos 🎊";
  return `${d} dias juntos`;
}

export function formatDatePT(d: string | Date): string {
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatShortPT(d: string | Date): string {
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "dd MMM yyyy", { locale: ptBR });
}

export function formatMonthPT(d: string | Date): string {
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "MMM/yy", { locale: ptBR });
}
