import pg from "pg";
import { readFileSync } from "node:fs";
import { loadEnv, applyEnvToProcess } from "./load-env.mjs";

const PROJECT_REF = "hscoblnnvlynrlyhhocm";
applyEnvToProcess(loadEnv());

const sql = readFileSync("supabase/deploy-pending.sql", "utf8")
  .replace(/^--.*$/gm, "")
  .trim();

const password = process.env.SUPABASE_DB_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;

if (!password && !databaseUrl) {
  console.error("SUPABASE_DB_PASSWORD ou DATABASE_URL necessário para conexão Postgres.");
  process.exit(1);
}

const connectionString =
  databaseUrl ??
  `postgresql://postgres:${encodeURIComponent(password)}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query(sql);
  console.log("SQL aplicado com sucesso via Postgres.");
} finally {
  await client.end();
}
