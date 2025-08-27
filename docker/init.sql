-- Initial database setup for Intown Plumbing
-- This file runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can add any initial data or additional setup here
-- For example, if you need to seed some initial app settings:

-- INSERT INTO "AppSetting" (key, value) VALUES 
--   ('default_timezone', 'America/New_York'),
--   ('company_name', 'Intown Plumbing')
-- ON CONFLICT (key) DO NOTHING;
