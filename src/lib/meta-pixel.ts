export const PIXEL_ID = "965322166283607";

type FbqEventName = "PageView" | "InitiateCheckout" | "Purchase" | "Lead" | "ViewContent";

interface Fbq {
  (cmd: "init", pixelId: string, data?: Record<string, unknown>): void;
  (cmd: "track", event: FbqEventName, params?: Record<string, unknown>, opts?: { eventID?: string }): void;
  (cmd: "trackCustom", event: string, params?: Record<string, unknown>, opts?: { eventID?: string }): void;
}

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export function trackEvent(
  event: FbqEventName,
  params?: Record<string, unknown>,
  eventID?: string,
) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventID) window.fbq("track", event, params, { eventID });
  else window.fbq("track", event, params);
}

export function trackCustom(event: string, params?: Record<string, unknown>, eventID?: string) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventID) window.fbq("trackCustom", event, params, { eventID });
  else window.fbq("trackCustom", event, params);
}

/** Lê um cookie pelo nome (browser only). */
function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Lê os cookies de tracking do Meta Pixel (`_fbp` / `_fbc`).
 * Se houver `fbclid` na URL atual e `_fbc` não estiver setado, deriva no formato esperado.
 */
export function readMetaTracking(): { fbp?: string; fbc?: string; eventSourceUrl?: string } {
  if (typeof window === "undefined") return {};
  const fbp = readCookie("_fbp");
  let fbc = readCookie("_fbc");
  if (!fbc) {
    try {
      const fbclid = new URL(window.location.href).searchParams.get("fbclid");
      if (fbclid) {
        fbc = `fb.1.${Date.now()}.${fbclid}`;
      }
    } catch {
      /* ignore */
    }
  }
  return {
    fbp: fbp || undefined,
    fbc: fbc || undefined,
    eventSourceUrl: window.location.href,
  };
}
