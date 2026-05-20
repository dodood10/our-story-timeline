const WINDOW_MS = 60 * 1000;
const MAX_MUTATIONS = 30;

const hits = new Map<string, { count: number; resetAt: number }>();

export function checkAdminMutationRateLimit(adminUserId: string): void {
  const now = Date.now();
  const entry = hits.get(adminUserId);
  if (!entry || now >= entry.resetAt) {
    hits.set(adminUserId, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  if (entry.count >= MAX_MUTATIONS) {
    throw new Error("Muitas ações admin. Aguarde um minuto.");
  }
  entry.count += 1;
}
