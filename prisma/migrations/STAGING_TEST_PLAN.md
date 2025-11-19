# Staging Migration Test Plan

This document outlines the steps to test the migration from production schema to staging schema in the staging environment.

## Prerequisites

- Access to staging database
- Staging `DATABASE_URL` environment variable configured
- Backup of staging database (optional but recommended)

## Steps

### Step 1: Backup Current Staging Database (Optional but Recommended)

```bash
# Set staging DATABASE_URL if not already set
export DATABASE_URL="your_staging_database_url"

# Create backup
pg_dump $DATABASE_URL > backup_staging_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Clean Staging Database

**⚠️ WARNING: This will delete ALL tables and data in staging!**

Use the provided script:

```bash
# Make sure DATABASE_URL is set to staging
export DATABASE_URL="your_staging_database_url"

# Run the cleanup script
./scripts/clean-database.sh
```

The script will:
- Drop all tables in the public schema
- Drop all enum types
- Drop the Prisma migrations table
- Ask for confirmation before proceeding

### Step 3: Run Production Init Migration

```bash
# Apply the production init migration
npx prisma migrate deploy --schema=prisma/schema.prisma
```

Or manually:

```bash
# Mark the init migration as applied
psql $DATABASE_URL -c "
CREATE TABLE IF NOT EXISTS _prisma_migrations (
    id VARCHAR(36) PRIMARY KEY,
    checksum VARCHAR(64) NOT NULL,
    finished_at TIMESTAMP,
    migration_name VARCHAR(255) NOT NULL,
    logs TEXT,
    rolled_back_at TIMESTAMP,
    started_at TIMESTAMP NOT NULL DEFAULT now(),
    applied_steps_count INTEGER NOT NULL DEFAULT 0
);

INSERT INTO _prisma_migrations (id, checksum, migration_name, started_at, applied_steps_count)
VALUES (
    gen_random_uuid()::text,
    'init_prod',
    '20251107225914_init',
    now(),
    0
);
"

# Apply the migration SQL
psql $DATABASE_URL -f prisma/migrations/20251107225914_init/migration.sql

# Mark as finished
psql $DATABASE_URL -c "
UPDATE _prisma_migrations 
SET finished_at = now(), applied_steps_count = 1 
WHERE migration_name = '20251107225914_init';
"
```

### Step 4: Populate Initial Data

```bash
# Import AppSettings
npm run import:test

# Run seed to create Admin user
npm run seed
```

### Step 5: Verify Production Schema

Verify that staging now has the production schema:

```bash
psql $DATABASE_URL -c "\d"  # List all tables
psql $DATABASE_URL -c "\dT" # List all types/enums
```

Expected tables:
- `User` (with `Role` enum, no `enabled` column)
- `UserImage`
- `AppSetting`
- `Booking` (with `status` as TEXT, not enum)

### Step 6: Apply Staging Migration

```bash
# Apply the migration from staging to production
psql $DATABASE_URL -f prisma/migrations/20251119124748_migrate_staging_to_prod/migration.sql
```

**⚠️ NOTE**: If the foreign keys for Booking fail (lines 160-162), you may need to:
1. Comment out those lines temporarily
2. Populate Customer, ServiceToJobType, and Technician tables
3. Uncomment and run those lines

### Step 7: Verify Migration Success

```bash
# Verify new schema
psql $DATABASE_URL -c "\d"  # List all tables
psql $DATABASE_URL -c "\dT" # List all types/enums

# Check that Role enum was renamed to UserRole
psql $DATABASE_URL -c "SELECT typname FROM pg_type WHERE typname = 'UserRole';"

# Check that UserImage was migrated to Image
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Image\";"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"UserImage\";"  # Should return error (table doesn't exist)

# Check that Booking.status is now an enum
psql $DATABASE_URL -c "\d \"Booking\""  # Should show status as BookingStatus enum
```

## Rollback (if needed)

If something goes wrong, restore from backup:

```bash
psql $DATABASE_URL < backup_staging_YYYYMMDD_HHMMSS.sql
```

