import type { SurprisePlan, PlanTier } from "./surprise-types";

export const ANSWERS_KEY = "ml.surprise.answers";
const PLAN_PREFIX = "ml.surprise.plan.v1:";

export function planCacheKey(tier: PlanTier): string {
  return `${PLAN_PREFIX}${tier}`;
}

export function readCachedPlan(tier: PlanTier): SurprisePlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(planCacheKey(tier));
    if (!raw) return null;
    return JSON.parse(raw) as SurprisePlan;
  } catch {
    return null;
  }
}

export function writeCachedPlan(tier: PlanTier, plan: SurprisePlan): void {
  localStorage.setItem(planCacheKey(tier), JSON.stringify(plan));
}

export function clearPlanCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${PLAN_PREFIX}basic`);
  localStorage.removeItem(`${PLAN_PREFIX}premium`);
  localStorage.removeItem("ml.surprise.plan");
  // Clear checklist check states so they don't bleed into a regenerated plan
  localStorage.removeItem("ml.surprise.essential");
  localStorage.removeItem("ml.surprise.optional");
  localStorage.removeItem("ml.surprise.checklist");
}
