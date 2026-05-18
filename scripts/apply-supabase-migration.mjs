#!/usr/bin/env node
/**
 * Aplica a migration pendente (RPC + RLS) no projeto remoto.
 *
 * .env — use UMA opção de admin:
 *   SUPABASE_ACCESS_TOKEN=sbp_...   (Account → Access Tokens, NÃO é JWT do projeto)
 *   SUPABASE_DB_PASSWORD=...       (Project → Database → password)
 *   DATABASE_URL=postgresql://...
 *
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...  (opcional; só para servidor, NÃO serve para deploy)
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { loadEnv, applyEnvToProcess } from "./load-env.mjs";

const PROJECT_REF = "hscoblnnvlynrlyhhocm";
applyEnvToProcess(loadEnv());

const sql = readFileSync("supabase/deploy-pending.sql", "utf8")
  .replace(/^--.*$/gm, "")
  .trim();

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

async function applyViaManagementApi(token, query = sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${body}`);
  }
  return body;
}

function applyViaPg() {
  const r = spawnSync("node", ["scripts/apply-via-pg.mjs"], {
    stdio: "inherit",
    shell: true,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

let accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const tokenKind = classifyKey(accessToken);

if (tokenKind === "service_role") {
  console.error(`
A variável SUPABASE_ACCESS_TOKEN contém a chave "service_role" (JWT do projeto).
Ela NÃO funciona na API de deploy (erro 401).

Corrija o .env assim:

  1) Renomeie para uso no servidor (opcional):
     SUPABASE_SERVICE_ROLE_KEY=<cole o JWT que está hoje em SUPABASE_ACCESS_TOKEN>

  2) Para deploy, adicione UMA destas:
     SUPABASE_ACCESS_TOKEN=sbp_...     ← https://supabase.com/dashboard/account/tokens
     OU
     SUPABASE_DB_PASSWORD=...          ← Project Settings → Database → Database password

Depois: npm run supabase:apply
`);
  process.exit(1);
}

if (tokenKind === "anon") {
  console.error(
    "SUPABASE_ACCESS_TOKEN parece ser a chave anon/publishable. Use sbp_... ou SUPABASE_DB_PASSWORD.",
  );
  process.exit(1);
}

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;

if (tokenKind === "pat") {
  console.log("→ Aplicando SQL via Management API (token sbp_)…");
  await applyViaManagementApi(accessToken);
  console.log("→ Recarregando cache do PostgREST…");
  await applyViaManagementApi(accessToken, "NOTIFY pgrst, 'reload schema'");
  console.log("→ OK");
} else if (databaseUrl || dbPassword) {
  console.log("→ Aplicando SQL via Postgres…");
  applyViaPg();
} else if (accessToken) {
  console.log("→ Tentando Management API…");
  await applyViaManagementApi(accessToken);
  console.log("→ OK");
} else {
  console.error(`
Credencial de admin ausente no .env.

Adicione UMA opção:
  SUPABASE_ACCESS_TOKEN=sbp_...
  SUPABASE_DB_PASSWORD=...
`);
  process.exit(1);
}

console.log("→ Verificando RPC…");
const check = spawnSync("node", ["scripts/check-supabase.mjs"], {
  stdio: "inherit",
  shell: true,
});
process.exit(check.status ?? 0);
