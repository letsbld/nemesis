-- Migration to add TOTP fields to users table
-- Run this manually if synchronize is disabled or if you prefer manual migrations

-- Add TOTP secret column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS totp_secret TEXT;

-- Add TOTP enabled column with default false
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE;

-- Update existing users to have TOTP disabled by default
UPDATE users 
SET totp_enabled = FALSE 
WHERE totp_enabled IS NULL;

-- Make totp_enabled NOT NULL after setting defaults
ALTER TABLE users 
ALTER COLUMN totp_enabled SET NOT NULL;

-- Add an index on totp_enabled for faster queries
CREATE INDEX IF NOT EXISTS idx_users_totp_enabled ON users(totp_enabled);

-- Optional: Add check constraint to ensure totp_enabled is boolean
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS chk_users_totp_enabled 
CHECK (totp_enabled IN (true, false));
