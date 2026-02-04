# Payments & Invoices

This project now includes a basic payments and invoicing workflow for the marketplace.

Key elements:

- New DB tables (see migration): `payments`, `invoices`.
- `src/lib/payments.ts` contains helper functions to create payments, process them (simulated), create payouts, and fetch invoices.
- Checkout flow now creates an `order` and a `payment` record, then attempts to process the payment.
- When an order is marked `delivered`, the system automatically creates payouts (ledger entries) for the farmer and transporter.
- UIs:
  - `src/pages/Payments.tsx`: payment history and earnings for the logged-in user.
  - `src/components/orders/OrderDetail.tsx`: shows payments for an order; markets can "Pay Now" if unpaid and view invoice info.
  - `src/components/dashboard/*Dashboard.tsx`: Farmer & Transporter dashboards now show earnings summary and recent payouts.

Notes:

- Payment processing is currently simulated (no real Stripe/M-Pesa integration). If you want to integrate a payment provider, replace `processPayment` in `src/lib/payments.ts` with the provider's API calls, and secure API keys via environment variables.
- Remember to run the SQL migration in `migrations/2026-02-02-add-payments-and-invoices.sql` against your Supabase/Postgres database.

Stripe integration scaffolding:

- Server API endpoints (for Vercel-style serverless functions):
  - `api/stripe/create-checkout-session.ts` — creates a Stripe Checkout Session and records a `payments` row (status: `unpaid`).
  - `api/stripe/webhook.ts` — verifies Stripe webhook signatures and updates payment records/invoices, and sets order status to `confirmed` when payment succeeds.
- Server-side Supabase client: `api/lib/supabaseServer.ts` (requires `SUPABASE_SERVICE_ROLE_KEY`).

Environment variables required for Stripe:

- `STRIPE_SECRET_KEY` — your Stripe secret key (server-side)
- `STRIPE_WEBHOOK_SECRET` — the webhook signing secret (from Stripe dashboard)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key for server operations
- `PUBLIC_URL` — base URL used for success/cancel redirects during development (optional)

Important: store all server-side keys securely (do NOT commit production keys to the repo). To enable webhooks on Vercel/your hosting provider, add the `api/stripe/webhook` endpoint as your Stripe webhook URL and provide `STRIPE_WEBHOOK_SECRET` to the app's environment variables.

Quick examples:

- Create a checkout session (server will create a `payments` row):

curl -X POST https://your-host.com/api/stripe/create-checkout-session \
 -H 'Content-Type: application/json' \
 -d '{"orderId":"ORD-123","amount":1500}'

- Stripe webhook: configure your Stripe dashboard to send events (checkout.session.completed, payment_intent.succeeded) to:

https://your-host.com/api/stripe/webhook

---

## Applying the migration locally (safe helper)

If you don't have the Supabase CLI installed, you can run the included Node migration helper. For safety it requires an explicit confirmation environment variable.

1. Ensure you have a connection URL to your Postgres (Supabase) database. Set it as `DATABASE_URL`.
2. Run (careful — this will modify your DB):

```bash
APPLY_PAYMENTS_MIGRATION=true DATABASE_URL="postgres://user:pass@host:5432/db" npm run migrate:payments
```

The script `scripts/apply-payments-migration.js` will load `migrations/2026-02-02-add-payments-and-invoices.sql` and execute it inside a transaction.

## Testing Stripe webhooks locally

Options:

- Using the Stripe CLI (recommended):
  1. Install the Stripe CLI (https://stripe.com/docs/stripe-cli).
  2. Run `stripe login` to authenticate.
  3. Start listening and forward events to your local webhook endpoint:
     - If using `vercel dev` or another serverless dev server (which exposes `api/*` routes locally):
       ```bash
       stripe listen --forward-to http://localhost:3000/api/stripe/webhook --events checkout.session.completed payment_intent.succeeded
       ```
     - If you're running your API via a custom local server, change the URL accordingly.
  4. Create a test checkout session (example using curl):

```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"orderId":"TEST-ORD-1","amount":1000}'
```

This returns a Stripe `url` you can open in your browser. Complete the checkout using Stripe test cards.

- If you cannot run the Stripe CLI you can register a webhook URL in the Stripe Dashboard pointing to a publicly reachable endpoint (ngrok or your deployed environment), then run a test checkout on your deployed app.

Notes & environment variables:

- `STRIPE_SECRET_KEY` — server-side Stripe key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (set from the Stripe CLI output or Dashboard)
- `SUPABASE_SERVICE_ROLE_KEY` — for server-side Supabase actions
- `PUBLIC_URL` — base url for return redirects (optional, defaults to `http://localhost:5173`)

---

If you'd like, I can:

- Add an automated test to exercise the checkout+webhook flow locally (requires Stripe CLI setup), or
- Add a convenience `dev` script that runs `vercel dev` + `stripe listen` together if you prefer.
