import { loadEnv, applyEnvToProcess } from "./load-env.mjs";

applyEnvToProcess(loadEnv());
const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = "hscoblnnvlynrlyhhocm";

async function q(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text}`);
  return JSON.parse(text);
}

const fns = await q(
  `SELECT proname::text FROM pg_proc WHERE pronamespace = 'public'::regnamespace AND proname IN ('get_couple_sync','upsert_couple_sync')`,
);
console.log("Funções no Postgres:", fns);

await q(`NOTIFY pgrst, 'reload schema'`);
console.log("PostgREST: NOTIFY reload schema enviado");
