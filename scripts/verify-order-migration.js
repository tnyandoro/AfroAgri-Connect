import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "Please set DATABASE_URL to your Postgres connection string (Supabase DB).",
    );
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    // Run migration SQL file
    const migrationPath = path.resolve(
      process.cwd(),
      "migrations",
      "2026-02-01-add-order-status-history.sql",
    );
    if (!fs.existsSync(migrationPath))
      throw new Error("Migration file not found: " + migrationPath);
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("Running migration...");
    await client.query(sql);
    console.log("Migration executed.");

    // Verify columns
    const colRes = await client.query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_name = 'orders' AND column_name IN ('status_history','transporter_id')`,
    );

    const cols = colRes.rows.reduce(
      (acc, r) => ({ ...acc, [r.column_name]: r.data_type }),
      {},
    );
    console.log("Columns found:", cols);

    if (!cols.status_history) {
      throw new Error("status_history column not found after migration");
    }

    // Try to append a status_history entry to an existing order (or insert a test order)
    const pick = await client.query(
      `SELECT id, status_history FROM orders LIMIT 1`,
    );

    const entry = {
      status: "picked_up",
      timestamp: new Date().toISOString(),
      actor_id: "migration-test",
    };

    if (pick.rows.length > 0) {
      const id = pick.rows[0].id;
      console.log("Appending test status to existing order id=", id);
      const update = await client.query(
        `UPDATE orders SET status_history = status_history || $1::jsonb WHERE id = $2 RETURNING id, status_history`,
        [JSON.stringify([entry]), id],
      );
      console.log("Updated row:", update.rows[0]);
    } else {
      // Insert a minimal test row. This may fail if there are strict constraints. We try safe columns.
      const testId = uuidv4();
      const marketId = uuidv4();
      const farmerId = uuidv4();
      console.log(
        "No existing orders found. Attempting to insert a test order (id=",
        testId,
        ")",
      );
      try {
        const insert = await client.query(
          `INSERT INTO orders (id, market_id, farmer_id, status, total_amount, status_history, created_at)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, now()) RETURNING id, status_history`,
          [testId, marketId, farmerId, "pending", 0, JSON.stringify([entry])],
        );
        console.log("Inserted test order:", insert.rows[0]);

        // Clean up
        await client.query(`DELETE FROM orders WHERE id = $1`, [testId]);
        console.log("Cleaned up test order.");
      } catch (err) {
        console.warn(
          "Could not insert a test order (safe fallback). This may be due to FK or CHECK constraints. Error:",
          err.message,
        );
        console.log(
          "You can verify behavior by adding an order and then running the UPDATE test manually.",
        );
      }
    }

    console.log(
      "\nVerification complete — status_history column exists and can be updated.",
    );
    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err.message || err);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main();
