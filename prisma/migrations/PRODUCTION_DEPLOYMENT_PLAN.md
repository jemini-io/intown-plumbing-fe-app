# Production Deployment Plan

## Step 1: Create Production Database Backup

Before deploying, create a backup of the production database:

```bash
docker run --rm -e PGPASSWORD=xfC1wOYmR4juavDl6FHr5tAWd9EECRbe postgres:latest pg_dump -h dpg-d3f7u4m3jp1c73c6qi50-a.oregon-postgres.render.com -U intown -d intown > prisma/backup/prod/backup_prod_$(date +%Y%m%d_%H%M%S).sql
```

**Verify the backup was created:**
```bash
ls -lh prisma/backup/prod/
```

## Step 2: Create Pull Request and Deploy

1. Create a Pull Request: `fix/incremental-migrations-to-deploy-prod` → `prod`
2. Once the PR is merged and `prod` branch is updated in GitHub, Render will automatically trigger a deployment
3. During the build process, Render will execute `npx prisma migrate deploy` (as part of `build:prod` script), which will apply the incremental migration

**Monitor the deployment:**
- Check Render logs to ensure migrations execute successfully
- Verify the application starts correctly after deployment
- Test critical functionality to ensure everything works

## Step 3: Rollback Plan (if deployment fails)

If the deployment fails or issues are detected:

1. **Revert to previous commit in Render:**
   - Go to Render dashboard
   - Select the previous commit (before the migration)
   - Deploy that commit

2. **Restore database from backup:**
   ```bash
   # Connect to production database and restore
   docker run --rm -e PGPASSWORD=xfC1wOYmR4juavDl6FHr5tAWd9EECRbe postgres:latest psql -h dpg-d3f7u4m3jp1c73c6qi50-a.oregon-postgres.render.com -U intown -d intown < prisma/backup/prod/backup_prod_YYYYMMDD_HHMMSS.sql
   ```

**Note:** Replace `YYYYMMDD_HHMMSS` with the actual timestamp from your backup file.

