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
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      return [k, v];
    }),
);

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);
const ins = await sb.from("couple_syncs").insert({ code: "TESTTESTTEST", data: { test: true } });
const sel = await sb.from("couple_syncs").select("code").eq("code", "TESTTESTTEST");
console.log(
  JSON.stringify(
    {
      insertError: ins.error?.message ?? null,
      selectRows: sel.data?.length ?? 0,
    },
    null,
    2,
  ),
);
