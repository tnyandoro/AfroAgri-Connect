#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  const confirm = process.env.APPLY_PAYMENTS_MIGRATION === "true";
  if (!confirm) {
    console.error(
      "Safety check: To run this migration set APPLY_PAYMENTS_MIGRATION=true",
    );
    console.error(
      "Example: APPLY_PAYMENTS_MIGRATION=true DATABASE_URL=postgres://... node scripts/apply-payments-migration.js",
    );
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!databaseUrl) {
    console.error(
      "Missing DATABASE_URL or SUPABASE_DB_URL environment variable.",
    );
    process.exit(1);
  }

  const sqlPath = path.resolve(
    __dirname,
    "../migrations/2026-02-02-add-payments-and-invoices.sql",
  );
  if (!fs.existsSync(sqlPath)) {
    console.error("Migration file not found at", sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf8");

  const client = new Client({ connectionString: databaseUrl });
  try {
    console.log("Connecting to DB...");
    await client.connect();
    console.log("Applying payments & invoices migration...");
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Migration applied successfully.");
  } catch (err) {
    console.error("Migration failed, rolling back:", err.message || err);
    try {
      await client.query("ROLLBACK");
    } catch (e) {}
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
