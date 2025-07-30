-- Add challenge field to users table for WebAuthn
ALTER TABLE users ADD COLUMN challenge TEXT;

-- Create user_passkeys table for storing WebAuthn credentials
CREATE TABLE user_passkeys (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "credentialId" VARCHAR(255) NOT NULL UNIQUE,
    "publicKey" TEXT NOT NULL,
    counter BIGINT NOT NULL DEFAULT 0,
    transports TEXT,
    name VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX idx_user_passkeys_user_id ON user_passkeys("userId");
CREATE INDEX idx_user_passkeys_credential_id ON user_passkeys("credentialId");

-- Add foreign key constraint if users table exists
-- ALTER TABLE user_passkeys ADD CONSTRAINT fk_user_passkeys_user_id 
-- FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
