import { useEffect, useState } from "react";
import { getPromoTimerSnapshot, type PromoTimerSnapshot } from "@/lib/promo-timer";

const EMPTY: PromoTimerSnapshot = {
  phase: "active",
  deadline: 0,
  hours: 8,
  minutes: 0,
  seconds: 0,
  display: "08:00:00",
};

export function usePromoTimer(): PromoTimerSnapshot {
  const [snapshot, setSnapshot] = useState<PromoTimerSnapshot>(EMPTY);

  useEffect(() => {
    const tick = () => setSnapshot(getPromoTimerSnapshot());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return snapshot;
}
