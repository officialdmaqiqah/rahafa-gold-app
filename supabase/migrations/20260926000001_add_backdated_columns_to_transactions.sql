-- Migration: Add backdated transaction columns to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_backdated BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS backdate_reason TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS price_source_date DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS manual_price_override BOOLEAN DEFAULT FALSE;

-- Backfill existing transactions
UPDATE transactions 
SET 
  is_backdated = COALESCE(is_backdated, FALSE),
  manual_price_override = COALESCE(manual_price_override, FALSE)
WHERE is_backdated IS NULL OR manual_price_override IS NULL;
