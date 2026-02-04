# Order Tracking System

This folder describes the new order tracking features added:

Features

- Market: View order history and statuses at `/orders/market` (via user menu > Orders).
- Farmer: Manage incoming orders at `/orders/farmer` — accept or reject (sets status to `confirmed` or `cancelled`).
- Transporter: See assigned deliveries at `/orders/transporter` and update delivery lifecycle: `picked_up` → `in_transit` → `delivered`.
- Real-time updates: frontend subscribes to relevant order changes and invalidates queries so UI updates automatically.
- Status history: each order keeps a `status_history` array with {status, timestamp, actor_id, note} entries.

Implementation Notes

- New files added under `src/lib`, `src/hooks`, `src/components/orders`, and `src/pages`.
- Supabase is used for data queries and realtime subscriptions using `supabase.from(...).on(...).subscribe()`.

Developer Notes

- Make sure the `orders` table in your Supabase has:
  - `status` (text)
  - `status_history` (jsonb) to store the timeline entries
  - `transporter_id` (nullable) to track assigned transporter

If you need help wiring server-side constraints/triggers or migrating DB schema, I can prepare SQL migration scripts.

Migration and Verification

1. Run the SQL migration to add `status_history` and `transporter_id`:
   - Using psql (example):

     ```bash
     psql "$DATABASE_URL" -f migrations/2026-02-01-add-order-status-history.sql
     ```

   - Or use the Supabase SQL Editor and run the contents of `migrations/2026-02-01-add-order-status-history.sql`.

2. Run the verification script (Node + pg) which executes the migration and performs a basic update test:
   - Ensure `DATABASE_URL` is set to your Postgres connection string (the Supabase DB connection string).
   - Install dev deps: `npm install` (this project adds `pg` as a dev dependency)
   - Run:

     ```bash
     npm run verify:orders-migration
     ```

   The script will:
   - Execute the migration file
   - Confirm `status_history` and `transporter_id` columns exist
   - Try to append a test status update to an existing order or insert a minimal test order to validate JSONB behavior

Developer notes

- If your DB schema uses strict FK or CHECK constraints that prevent the test insertion, create a sample order via the app or modify the test script to use valid IDs.
- If you want, I can add a more robust migration runner that grabs the DB connection from Supabase project settings automatically.
