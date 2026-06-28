-- Add referred_by column to affiliates table
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS referred_by text;
