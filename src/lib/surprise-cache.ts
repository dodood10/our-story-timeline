import { SurprisePlanSchema, type SurprisePlan, type PlanTier } from "./surprise-types";

export const ANSWERS_KEY = "ml.surprise.answers";
const PLAN_PREFIX_V1 = "ml.surprise.plan.v1:";
const PLAN_PREFIX_V2 = "ml.surprise.plan.v2:";

export function planCacheKey(tier: PlanTier): string {
  return `${PLAN_PREFIX_V2}${tier}`;
}

export function readCachedPlan(tier: PlanTier): SurprisePlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(planCacheKey(tier)) ?? localStorage.getItem(`${PLAN_PREFIX_V1}${tier}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const result = SurprisePlanSchema.safeParse(parsed);
    if (!result.success) return null;
    return result.data;
  } catch {
    return null;
  }
}

export function writeCachedPlan(tier: PlanTier, plan: SurprisePlan): void {
  localStorage.setItem(planCacheKey(tier), JSON.stringify(plan));
}

export function clearPlanCache(): void {
  if (typeof window === "undefined") return;
  for (const tier of ["basic", "premium"] as const) {
    localStorage.removeItem(`${PLAN_PREFIX_V1}${tier}`);
    localStorage.removeItem(`${PLAN_PREFIX_V2}${tier}`);
  }
  localStorage.removeItem("ml.surprise.plan");
  localStorage.removeItem("ml.surprise.essential");
  localStorage.removeItem("ml.surprise.optional");
  localStorage.removeItem("ml.surprise.checklist");
  localStorage.removeItem("ml.surprise.shopping");
}
