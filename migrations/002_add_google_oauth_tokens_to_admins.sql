-- Migration to add Google OAuth token fields to admins table
-- Run this manually if synchronize is disabled or if you prefer manual migrations

-- Add access token column
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS access_token TEXT;

-- Add refresh token column
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS refresh_token TEXT;

-- Add token expiration column
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP;

-- Add index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Add index on token expiration for cleanup queries
CREATE INDEX IF NOT EXISTS idx_admins_token_expires_at ON admins(token_expires_at);
