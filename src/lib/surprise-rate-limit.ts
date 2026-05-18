const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;

/**
 * NOTE: In serverless/edge environments (Cloudflare Workers) this Map lives per-isolate,
 * not per-process. Requests routed to different isolates bypass this limit.
 * The primary rate-limit protection comes from the Lovable AI Gateway itself.
 * For stricter control, replace this with Cloudflare KV or Durable Objects.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkSurpriseRateLimit(clientKey: string): void {
  const now = Date.now();
  const entry = hits.get(clientKey);
  if (!entry || now >= entry.resetAt) {
    hits.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  if (entry.count >= MAX_REQUESTS) {
    throw new Error("Muitas requisições. Tente novamente em alguns minutos.");
  }
  entry.count += 1;
}

export function clientKeyFromRequest(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
