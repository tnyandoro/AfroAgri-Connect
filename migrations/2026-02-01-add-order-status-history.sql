-- Migration: Add status_history and transporter_id to orders table
-- Run with psql or Supabase SQL editor

BEGIN;

-- Add JSONB column for status history; default to empty array
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb NOT NULL;

-- Add transporter_id column if missing (nullable UUID)
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS transporter_id UUID;

-- Ensure status column exists and is TEXT (no destructive change)
-- If your application uses an ENUM, handle accordingly in a separate migration
ALTER TABLE IF EXISTS orders
  ALTER COLUMN status TYPE TEXT USING status::text;

COMMIT;
