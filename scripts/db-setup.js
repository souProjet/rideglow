/**
 * Applies db/schema.sql to $DATABASE_URL.
 *
 * This replaces `psql -f`, which is not installed on every machine that can
 * deploy this site. The driver is the one the app already runs on, so setting
 * the database up needs nothing the runtime does not need anyway.
 *
 * The schema is `create ... if not exists` throughout, so running this again is
 * a no-op and is the right move after any change to db/schema.sql.
 */
import { readFile } from "node:fs/promises";
import { Client } from "@neondatabase/serverless";

/** The driver echoes the connection string in some errors. Never print it. */
const redact = (value) => String(value).replace(/postgres(ql)?:\/\/\S+/gi, "<connection>");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const client = new Client(url);

try {
  await client.connect();
  await client.query(await readFile(new URL("../db/schema.sql", import.meta.url), "utf8"));

  const { rows } = await client.query(
    `select table_name from information_schema.tables
      where table_schema = 'public' order by table_name`,
  );
  console.log(`Schema applied. Tables: ${rows.map((row) => row.table_name).join(", ")}`);
} catch (error) {
  console.error("Schema failed:", redact(error?.message ?? error));
  process.exitCode = 1;
} finally {
  await client.end();
}
