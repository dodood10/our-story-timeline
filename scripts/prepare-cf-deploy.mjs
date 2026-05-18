/** Remove chaves de deploy local do .dev.vars gerado pelo build (não enviar ao Worker). */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const path = "dist/server/.dev.vars";
if (!existsSync(path)) process.exit(0);

const strip = new Set(["SUPABASE_ACCESS_TOKEN", "SUPABASE_DB_PASSWORD"]);
const out = readFileSync(path, "utf8")
  .split("\n")
  .filter((line) => {
    const key = line.split("=")[0]?.trim();
    return key && !strip.has(key);
  })
  .join("\n");

writeFileSync(path, out.endsWith("\n") ? out : `${out}\n`);
