#!/usr/bin/env node
/**
 * Aplica supabase/migrations/20260520120000_auth_entitlements_workspaces.sql
 *
 * Requer no .env UMA credencial de admin:
 *   SUPABASE_ACCESS_TOKEN=sbp_...  (Account → Access Tokens)
 *   SUPABASE_DB_PASSWORD=...
 *   DATABASE_URL=postgresql://...
 *
 * SUPABASE_SERVICE_ROLE_KEY sozinha NÃO aplica DDL (use o SQL Editor se for o único que você tem).
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { loadEnv, applyEnvToProcess, warnIfViteLeaks } from "./load-env.mjs";

const PROJECT_REF = "hscoblnnvlynrlyhhocm";
const env = loadEnv();
warnIfViteLeaks(env);
applyEnvToProcess(env);

const viteProjectId = env.VITE_SUPABASE_PROJECT_ID ?? "";
if (viteProjectId.startsWith("sbp_")) {
  console.error(`
ERRO: VITE_SUPABASE_PROJECT_ID contém um token sbp_ (Personal Access Token).
Isso NÃO pode ter prefixo VITE_ — iria para o bundle do browser.

Corrija o .env:
  Remova sbp_ de VITE_SUPABASE_PROJECT_ID
  VITE_SUPABASE_PROJECT_ID=hscoblnnvlynrlyhhocm   (só o ref do projeto, opcional)
  SUPABASE_ACCESS_TOKEN=sbp_...                   (sem VITE_, para npm run supabase:apply-auth)
`);
  process.exit(1);
}

const sql = readFileSync(
  "supabase/migrations/20260520120000_auth_entitlements_workspaces.sql",
  "utf8",
).trim();

function jwtPayload(key) {
  try {
    return JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function classifyKey(key) {
  if (!key) return "missing";
  if (key.startsWith("sbp_")) return "pat";
  const p = jwtPayload(key);
  if (p?.role === "service_role") return "service_role";
  if (p?.role === "anon") return "anon";
  return "unknown";
}

async function applyViaManagementApi(token) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Management API ${res.status}: ${body}`);
  return body;
}

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const kind = classifyKey(accessToken);

if (kind === "service_role") {
  console.error(`
Você tem SUPABASE_SERVICE_ROLE_KEY no .env (ótimo para webhook), mas DDL precisa de:

  • SQL Editor: cole supabase/migrations/20260520120000_auth_entitlements_workspaces.sql
  • OU adicione SUPABASE_ACCESS_TOKEN=sbp_... e rode: npm run supabase:apply-auth
  • OU SUPABASE_DB_PASSWORD=... no .env
`);
  process.exit(1);
}

if (kind === "pat") {
  console.log("→ Aplicando migration Auth via Management API…");
  await applyViaManagementApi(accessToken);
  await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: "NOTIFY pgrst, 'reload schema'" }),
  });
  console.log("→ OK");
} else if (process.env.DATABASE_URL || process.env.SUPABASE_DB_PASSWORD) {
  process.env.MIGRATION_SQL_PATH =
    "supabase/migrations/20260520120000_auth_entitlements_workspaces.sql";
  const r = spawnSync("node", ["scripts/apply-via-pg.mjs"], { stdio: "inherit", shell: true });
  process.exit(r.status ?? 1);
} else {
  console.error(`
Sem credencial de admin para aplicar DDL.

Opção rápida: Dashboard → SQL → New query → cole o arquivo:
  supabase/migrations/20260520120000_auth_entitlements_workspaces.sql

Depois: npm run supabase:check-auth
`);
  process.exit(1);
}

const check = spawnSync("node", ["scripts/check-auth-schema.mjs"], {
  stdio: "inherit",
  shell: true,
});
process.exit(check.status ?? 0);
