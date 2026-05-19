#!/usr/bin/env node
/**
 * Deploy completo no Supabase (projeto hscoblnnvlynrlyhhocm):
 * 1. SQL pendente (RPC couple_syncs) via Management API
 * 2. Migration Auth (idempotente — ignora se já existir)
 * 3. Regenera src/integrations/supabase/types.ts
 * 4. Verificações
 *
 * Requer no .env: SUPABASE_ACCESS_TOKEN=sbp_...
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { loadEnv, applyEnvToProcess, warnIfViteLeaks } from "./load-env.mjs";

const PROJECT_REF = "hscoblnnvlynrlyhhocm";

applyEnvToProcess(loadEnv());
warnIfViteLeaks(loadEnv());

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token?.startsWith("sbp_")) {
  console.error("Defina SUPABASE_ACCESS_TOKEN=sbp_... no .env (Account → Access Tokens).");
  process.exit(1);
}

async function runSql(query, label) {
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
    if (body.includes("already exists") || body.includes("duplicate")) {
      console.log(`→ ${label}: já aplicado, pulando`);
      return;
    }
    throw new Error(`${label} (${res.status}): ${body}`);
  }
  console.log(`→ ${label}: OK`);
}

function runNode(script) {
  const r = spawnSync("node", [script], { stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("=== Deploy Supabase ===\n");

const pending = readFileSync("supabase/deploy-pending.sql", "utf8")
  .replace(/^--.*$/gm, "")
  .trim();
if (pending) await runSql(pending, "deploy-pending.sql");

const authSql = readFileSync(
  "supabase/migrations/20260520120000_auth_entitlements_workspaces.sql",
  "utf8",
).trim();
await runSql(authSql, "auth_entitlements_workspaces");

await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: "NOTIFY pgrst, 'reload schema'" }),
});

console.log("→ Link CLI…");
spawnSync("npx", ["supabase@latest", "link", "--project-ref", PROJECT_REF, "--yes"], {
  stdio: "inherit",
  shell: true,
});

console.log("→ Regenerando types.ts…");
const types = spawnSync(
  "npx",
  ["supabase@latest", "gen", "types", "typescript", "--linked", "--schema", "public"],
  { encoding: "utf8", shell: true },
);
if (types.status !== 0) {
  console.error(types.stderr || types.stdout);
  process.exit(types.status ?? 1);
}
writeFileSync("src/integrations/supabase/types.ts", types.stdout);

runNode("scripts/check-supabase.mjs");
runNode("scripts/check-auth-schema.mjs");

console.log("\n=== Deploy Supabase concluído ===");
