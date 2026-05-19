/** @deprecated Use workspace-sync — mantido para compatibilidade de imports. */
export { isSupabaseConfigured } from "./workspace-sync";

/** @deprecated Sync legado por código — desabilitado após migration Auth. */
export function generateSyncCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => alphabet[b % alphabet.length]).join("");
}

export async function pushSync(_code: string): Promise<void> {
  throw new Error(
    "Sync por código foi descontinuado. Faça login e use Sincronizar entre dispositivos em Configurações.",
  );
}

export async function pullSync(_code: string): Promise<never> {
  throw new Error(
    "Sync por código foi descontinuado. Faça login e use Sincronizar entre dispositivos em Configurações.",
  );
}
