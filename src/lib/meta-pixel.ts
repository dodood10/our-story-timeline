export const PIXEL_ID = "965322166283607";

type FbqEventName =
  | "PageView"
  | "InitiateCheckout"
  | "Purchase"
  | "Lead"
  | "ViewContent";

interface Fbq {
  (cmd: "init", pixelId: string, data?: Record<string, unknown>): void;
  (cmd: "track", event: FbqEventName, params?: Record<string, unknown>): void;
  (cmd: "trackCustom", event: string, params?: Record<string, unknown>): void;
}

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export function trackEvent(
  event: FbqEventName,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params);
  }
}

export function trackCustom(
  event: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", event, params);
  }
}
