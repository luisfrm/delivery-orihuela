-- Add additional_notes column to orders table
-- This column stores user-provided notes for the rider

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

COMMENT ON COLUMN orders.additional_notes IS 'Optional notes from the client for the rider (e.g., instructions, extra data)';