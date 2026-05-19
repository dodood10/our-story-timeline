// v2 = janela principal 48h + extensao "ultima chance" 24h.
// Bump na chave invalida visitantes cujo timer v1 (8h+1h) ja expirou.
export const PROMO_TIMER_STORAGE_KEY = "ml.promo.timer.v2";

const MAIN_DURATION_MS = 48 * 60 * 60 * 1000;
const EXTENSION_MS = 24 * 60 * 60 * 1000;

export type PromoTimerPhase = "active" | "lastChance" | "expired";

export interface PromoTimerState {
  deadline: number;
  extended: boolean;
}

export interface PromoTimerSnapshot {
  phase: PromoTimerPhase;
  deadline: number;
  hours: number;
  minutes: number;
  seconds: number;
  display: string;
}

function readRaw(): PromoTimerState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROMO_TIMER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PromoTimerState;
    if (typeof parsed.deadline !== "number" || typeof parsed.extended !== "boolean") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function write(state: PromoTimerState): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PROMO_TIMER_STORAGE_KEY, JSON.stringify(state));
}

function createInitial(): PromoTimerState {
  return {
    deadline: Date.now() + MAIN_DURATION_MS,
    extended: false,
  };
}

/** Loads or creates timer state; applies last-chance extension when main window expires. */
export function resolvePromoTimerState(): PromoTimerState {
  let state = readRaw() ?? createInitial();

  if (Date.now() >= state.deadline && !state.extended) {
    state = {
      deadline: Date.now() + EXTENSION_MS,
      extended: true,
    };
    write(state);
  } else if (!readRaw()) {
    write(state);
  }

  return state;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function snapshotFromState(state: PromoTimerState, now = Date.now()): PromoTimerSnapshot {
  const remaining = Math.max(0, state.deadline - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let phase: PromoTimerPhase = "active";
  if (remaining <= 0) {
    phase = "expired";
  } else if (state.extended) {
    phase = "lastChance";
  }

  return {
    phase,
    deadline: state.deadline,
    hours,
    minutes,
    seconds,
    display: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
}

export function getPromoTimerSnapshot(now = Date.now()): PromoTimerSnapshot {
  return snapshotFromState(resolvePromoTimerState(), now);
}

/** Fixed height of the promo urgency bar (sticky header offset). */
export const PROMO_BAR_HEIGHT = "2.5rem";

/** Promo bar on landing (`/`) only. */
export function shouldShowLandingPromoTimer(pathname: string): boolean {
  return pathname === "/";
}

/** Promo bar in checkout funnel: `/surprise` → upsell (not quiz/plan). */
export function shouldShowFunnelPromoTimer(pathname: string): boolean {
  return (
    pathname === "/surprise" ||
    pathname === "/surprise/" ||
    pathname === "/surprise/upsell"
  );
}
