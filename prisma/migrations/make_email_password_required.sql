-- Delete users with null emails or passwords
DELETE FROM users WHERE email IS NULL OR password IS NULL;

-- Make email and password required
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN password SET NOT NULL; 