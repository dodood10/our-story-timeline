/** Sync por workspace vinculado à conta autenticada. */
import { supabase } from "@/integrations/supabase/client";
import { exportBackup, importBackup, type BackupBundle } from "./backup";
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key);
}

const INVITE_CODE_RE = /^[A-Z2-9]{8,12}$/;

export async function ensureWorkspace(): Promise<string> {
  const { data, error } = await supabase.rpc("ensure_my_workspace");
  if (error) throw new Error(error.message || "Falha ao preparar workspace");
  if (!data) throw new Error("Workspace não criado");
  return data;
}

export async function getInviteCode(): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_my_workspace_invite_code");
  if (error) return null;
  return data ?? null;
}

export async function joinPartner(inviteCode: string): Promise<string> {
  const normalized = inviteCode.trim().toUpperCase();
  if (!INVITE_CODE_RE.test(normalized)) {
    throw new Error("Código de convite inválido");
  }
  const { data, error } = await supabase.rpc("join_workspace_by_code", {
    p_code: normalized,
  });
  if (error) throw new Error(error.message || "Falha ao entrar no workspace");
  if (!data) throw new Error("Workspace não encontrado");
  return data;
}

export async function pushWorkspaceSnapshot(): Promise<void> {
  const workspaceId = await ensureWorkspace();
  const bundle = await exportBackup();
  const { error } = await supabase.from("workspace_snapshots").upsert(
    {
      workspace_id: workspaceId,
      data: bundle as unknown as never,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id" },
  );
  if (error) throw new Error(error.message || "Falha ao enviar para a nuvem");
}

export async function pullWorkspaceSnapshot(): Promise<BackupBundle> {
  const workspaceId = await ensureWorkspace();
  const { data, error } = await supabase
    .from("workspace_snapshots")
    .select("data")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw new Error(error.message || "Falha ao baixar da nuvem");
  if (!data?.data) throw new Error("Nenhum backup na nuvem ainda");
  const bundle = data.data as unknown as BackupBundle;
  await importBackup(bundle);
  return bundle;
}

export async function getWorkspaceMemberCount(): Promise<number> {
  const workspaceId = await ensureWorkspace();
  const { count, error } = await supabase
    .from("workspace_members")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);
  if (error) return 1;
  return count ?? 1;
}
