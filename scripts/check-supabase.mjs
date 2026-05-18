import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      const k = l.slice(0, i).trim();
      let v = l.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      return [k, v];
    }),
);

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const sb = createClient(url, key);
const rpc = await sb.rpc("get_couple_sync", { p_code: "ABCDEFGHJKMN" });
const tbl = await sb.from("couple_syncs").select("code").limit(1);

console.log(
  JSON.stringify(
    {
      rpcOk: !rpc.error,
      rpcError: rpc.error?.message ?? null,
      tableOk: !tbl.error,
      tableError: tbl.error?.message ?? null,
      tableRowCount: tbl.data?.length ?? 0,
      secureRpcDeployed: !rpc.error,
      directTableBlocked: !tbl.error && (tbl.data?.length ?? 0) === 0,
    },
    null,
    2,
  ),
);
