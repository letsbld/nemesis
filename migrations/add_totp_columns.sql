-- TOTP Migration Script
-- Run this SQL script if you need to manually add TOTP columns to existing database

-- Add TOTP columns to users table
ALTER TABLE users 
ADD COLUMN totp_secret TEXT NULL,
ADD COLUMN totp_enabled BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX idx_users_totp_enabled ON users(totp_enabled);

-- Optional: Set all existing users to require TOTP setup
-- UPDATE users SET totp_enabled = FALSE WHERE totp_enabled IS NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('totp_secret', 'totp_enabled');
