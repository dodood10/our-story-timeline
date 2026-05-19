import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

/**
 * HTTP security headers applied to every response.
 *
 * CSP notes:
 *  - unsafe-inline for scripts: required by the blocking theme/SW inline script in __root.tsx
 *  - unsafe-inline for styles: required by Tailwind runtime classes and chart.tsx CSS-in-JS
 *  - frame-ancestors 'none': prevents clickjacking (replaces X-Frame-Options in modern browsers)
 *  - object-src 'none': blocks Flash and plugin embeds entirely
 */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=(), payment=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://connect.facebook.net https://sdk.mercadopago.com https://*.mercadopago.com https://*.mlstatic.com https://*.mercadolibre.com https://*.mercadolivre.com",
    "script-src-elem 'self' 'unsafe-inline' https://connect.facebook.net https://sdk.mercadopago.com https://*.mercadopago.com https://*.mlstatic.com https://*.mercadolibre.com https://*.mercadolivre.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.mlstatic.com",
    "font-src 'self' https://fonts.gstatic.com https://cdn.gpteng.co https://*.mlstatic.com",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://nominatim.openstreetmap.org https://www.facebook.com https://*.mlstatic.com https://*.mercadopago.com https://*.mercadolibre.com https://*.mercadolivre.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://ai.gateway.lovable.dev https://nominatim.openstreetmap.org https://www.facebook.com https://connect.facebook.net https://api.mercadopago.com https://*.mercadopago.com https://*.mlstatic.com https://*.mercadolibre.com https://*.mercadolivre.com https://api.mercadolibre.com",
    "frame-src 'self' https://*.mercadopago.com https://*.mlstatic.com https://*.mercadolibre.com https://*.mercadolivre.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; "),
};

function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function brandedErrorResponse(): Response {
  return addSecurityHeaders(
    new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    }),
  );
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return addSecurityHeaders(normalized);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
