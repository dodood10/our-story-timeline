/** Verifica role admin em app_metadata do Supabase Auth. */
export function isAdminFromAppMetadata(meta: Record<string, unknown> | undefined): boolean {
  return meta?.role === "admin";
}
