-- Script to drop all tables in the correct order (respecting foreign keys)
-- Execute this in your PostgreSQL REPL connected to staging database

-- Drop tables with foreign keys first (dependent tables)
DROP TABLE IF EXISTS "Booking" CASCADE;
DROP TABLE IF EXISTS "ServiceToJobTypeSkill" CASCADE;
DROP TABLE IF EXISTS "TechnicianSkill" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "Technician" CASCADE;
DROP TABLE IF EXISTS "ServiceToJobType" CASCADE;
DROP TABLE IF EXISTS "Skill" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "EmailAddress" CASCADE;
DROP TABLE IF EXISTS "PhoneNumber" CASCADE;
DROP TABLE IF EXISTS "Image" CASCADE;
DROP TABLE IF EXISTS "AppSetting" CASCADE;
DROP TABLE IF EXISTS "UserImage" CASCADE;  -- In case it exists from prod schema

-- Drop all enum types
DROP TYPE "BookingStatus" CASCADE;
DROP TYPE "CustomerType" CASCADE;
DROP TYPE "TechnicianStatus" CASCADE;
DROP TYPE "UserRole" CASCADE;
DROP TYPE "Role" CASCADE;  -- In case it exists from prod schema

-- Drop Prisma migrations table
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Verify everything is dropped
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e';

