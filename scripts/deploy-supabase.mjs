#!/usr/bin/env node
/**
 * Deploy Supabase migrations to the linked project (hscoblnnvlynrlyhhocm).
 * Requires: npx supabase login OR SUPABASE_ACCESS_TOKEN in environment.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { loadEnv, applyEnvToProcess } from "./load-env.mjs";

applyEnvToProcess(loadEnv());

const projectRef = "hscoblnnvlynrlyhhocm";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: true,
    ...opts,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const hasAdmin =
  process.env.SUPABASE_ACCESS_TOKEN ||
  process.env.SUPABASE_DB_PASSWORD ||
  process.env.DATABASE_URL;

if (hasAdmin) {
  spawnSync("node", ["scripts/apply-supabase-migration.mjs"], {
    stdio: "inherit",
    shell: true,
  });
  process.exit(0);
}

console.log("→ Sem token/senha no .env; tentando CLI logado…");
console.log("→ Linking project", projectRef);
run("npx", ["supabase@latest", "link", "--project-ref", projectRef]);
console.log("→ Pushing migrations");
run("npx", ["supabase@latest", "db", "push"]);

console.log("→ Regenerating TypeScript types");
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

console.log("→ Verifying RPC...");
run("node", ["scripts/check-supabase.mjs"]);

console.log("\nDeploy concluído.");
