-- Migration: Add username alias column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique_idx
ON users (LOWER(username))
WHERE username IS NOT NULL;

-- Set initial usernames
UPDATE users SET username = 'owner' WHERE whatsapp_number_normalized = '6282372078677';
UPDATE users SET username = 'admin' WHERE whatsapp_number_normalized = '6285188071133';
