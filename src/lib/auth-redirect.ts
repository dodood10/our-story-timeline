/** URL de callback para confirmação de e-mail e reset de senha. */
export function getAuthRedirectUrl(): string {
  const fromEnv = import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined;
  if (fromEnv?.trim()) return fromEnv.trim();
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }
  return "http://localhost:5173/auth/callback";
}
