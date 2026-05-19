import { createClient } from "@supabase/supabase-js";
import { loadEnv, applyEnvToProcess } from "./load-env.mjs";

applyEnvToProcess(loadEnv());

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const sb = createClient(url, key);

const tables = ["profiles", "user_entitlements", "couple_workspaces", "workspace_snapshots"];
const results = {};

for (const t of tables) {
  const r = await sb.from(t).select("*").limit(1);
  results[t] = r.error ? { ok: false, error: r.error.message } : { ok: true };
}

const rpc = await sb.rpc("ensure_my_workspace");
results.ensure_my_workspace = rpc.error ? { ok: false, error: rpc.error.message } : { ok: true };

console.log(JSON.stringify(results, null, 2));
