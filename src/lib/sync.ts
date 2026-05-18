/** Optional cross-device sync via Supabase using a shared secret code. */
import { supabase } from "@/integrations/supabase/client";
import { exportBackup, importBackup, type BackupBundle } from "./backup";

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key);
}

const SYNC_CODE_RE = /^[A-Z2-9]{12}$/;

export function generateSyncCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => alphabet[b % alphabet.length]).join("");
}

export async function pushSync(code: string): Promise<void> {
  const bundle = await exportBackup();
  const normalized = code.trim().toUpperCase();
  if (!SYNC_CODE_RE.test(normalized)) throw new Error("Código de sincronização inválido");
  const { error } = await supabase.rpc("upsert_couple_sync", {
    p_code: normalized,
    p_data: bundle as unknown as never,
  });
  if (error) throw new Error(error.message || "Falha ao sincronizar com a nuvem");
}

export async function pullSync(code: string): Promise<BackupBundle> {
  const normalized = code.trim().toUpperCase();
  if (!SYNC_CODE_RE.test(normalized)) throw new Error("Código de sincronização inválido");
  const { data, error } = await supabase.rpc("get_couple_sync", {
    p_code: normalized,
  });
  if (error) throw new Error(error.message || "Falha ao buscar dados da nuvem");
  if (!data) throw new Error("Código não encontrado ou sem dados salvos");
  const bundle = data as unknown as BackupBundle;
  await importBackup(bundle);
  return bundle;
}
