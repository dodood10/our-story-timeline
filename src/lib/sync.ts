/** Optional cross-device sync via Supabase using a shared secret code. */
import { supabase } from "@/integrations/supabase/client";
import { exportBackup, importBackup, type BackupBundle } from "./backup";

export function generateSyncCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => alphabet[b % alphabet.length]).join("");
}

export async function pushSync(code: string): Promise<void> {
  const bundle = await exportBackup();
  const { error } = await supabase
    .from("couple_syncs")
    .upsert({ code, data: bundle as never }, { onConflict: "code" });
  if (error) throw error;
}

export async function pullSync(code: string): Promise<BackupBundle> {
  const { data, error } = await supabase
    .from("couple_syncs")
    .select("data")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Código não encontrado");
  const bundle = data.data as unknown as BackupBundle;
  await importBackup(bundle);
  return bundle;
}
