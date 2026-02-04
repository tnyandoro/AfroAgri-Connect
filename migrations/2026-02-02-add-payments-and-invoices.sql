-- Migration: Add payments & invoices tables

CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text REFERENCES orders(id) ON DELETE SET NULL,
  market_id text,
  farmer_id text,
  transporter_id text,
  amount numeric NOT NULL,
  currency text DEFAULT 'KES',
  method text,
  status text NOT NULL DEFAULT 'unpaid',
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz NULL,
  metadata jsonb NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  url text NULL
);

-- Optional: index on recipient
CREATE INDEX IF NOT EXISTS payments_farmer_idx ON payments (farmer_id);
CREATE INDEX IF NOT EXISTS payments_transporter_idx ON payments (transporter_id);
CREATE INDEX IF NOT EXISTS payments_market_idx ON payments (market_id);
