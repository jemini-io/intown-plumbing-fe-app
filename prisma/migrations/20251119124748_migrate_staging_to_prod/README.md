# Migration from Staging to Production

This migration transforms the production database schema to match the staging schema.

## ⚠️ CRITICAL WARNINGS

### 1. Booking Foreign Keys
The foreign keys for `Booking` (lines 160-162) **WILL FAIL** if:
- The `customerId` values in `Booking` do not exist in the `Customer` table
- The `serviceId` values in `Booking` do not exist in the `ServiceToJobType` table
- The `technicianId` values in `Booking` do not exist in the `Technician` table

**Solution**: You must populate the `Customer`, `ServiceToJobType`, and `Technician` tables with the corresponding data BEFORE running this migration, or temporarily comment out these foreign keys and add them after populating the data.

### 2. Booking.status Migration
The migration assumes that the `status` values in `Booking` are:
- `'PENDING'`, `'SCHEDULED'`, `'CANCELED'`/`'CANCELLED'`, or `'COMPLETED'`
- Any other value will be mapped to `'SCHEDULED'` by default

### 3. UserImage to Image Migration
Data from `UserImage` is automatically migrated to `Image`. The `User` foreign keys are updated to point to `Image`.

## Recommended Execution Steps

1. **Backup the production database**
   ```bash
   pg_dump $DATABASE_URL > backup_prod_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Verify existing data in Booking**
   ```sql
   SELECT DISTINCT "customerId", "serviceId", "technicianId" FROM "Booking";
   ```

3. **Populate new tables** (if necessary):
   - `Customer`: Create records for each unique `customerId` in `Booking`
   - `ServiceToJobType`: Create records for each unique `serviceId` in `Booking`
   - `Technician`: Create records for each unique `technicianId` in `Booking`

4. **Run migration in a test environment first**

5. **Run migration in production**
   ```bash
   npx prisma migrate deploy
   ```

## Main Changes

- ✅ `Role` enum renamed to `UserRole` (preserves data)
- ✅ `UserImage` migrated to `Image` (preserves data)
- ✅ `Booking.status` migrated from String to `BookingStatus` enum (preserves data)
- ✅ New tables created: `Skill`, `ServiceToJobType`, `Technician`, `Customer`, `PhoneNumber`, `EmailAddress`
- ✅ New relation tables: `ServiceToJobTypeSkill`, `TechnicianSkill`
- ✅ Foreign keys added to `Booking` (requires previous data in related tables)
