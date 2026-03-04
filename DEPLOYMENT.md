# InTown Plumbing FE App — Deployment Guide

## Environments

| Env | Branch | URL | Render Service | Auto-Deploy |
|-----|--------|-----|----------------|-------------|
| **STG** | `main` | https://intown-plumbing-fe-app-test.onrender.com | `srv-d1s13eje5dus73flrtpg` | ✅ Yes |
| **PROD** | `prod` | https://consult.intowntx.com | `srv-d11j5cndiees73fek5eg` | ✅ Yes |

## Deploy to Staging

Push to `main` — auto-deploys.

```bash
git push origin main
```

## Deploy to Production

Merge `main` → `prod` and push:

```bash
git checkout prod
git merge origin/main --no-edit
git push origin prod
git checkout main
```

Auto-deploy triggers on push. If it doesn't, trigger manually via Render dashboard → Manual Deploy → Deploy latest commit.

## What Happens During Build

Render runs: `npm install && npm run build`

`npm run build` includes:
1. `prisma generate` — generates Prisma client
2. `prisma migrate deploy` — applies any new migrations to the DB
3. `generate:sdk` — generates ServiceTitan SDK
4. `next lint` — lints
5. `next build` — production build

**DB migrations are automatic** — no manual migration step needed.

## Environment Variables

- **STG:** Render env group `test_env_group` (`evg-d1s13t3ipnbc73el952g`)
- **PROD:** Render env group `prod_env_group` (`evg-d1s154emcj7s73ec61e0`)

## Local Dev

```bash
cp .example.env .env.test.local    # then fill in values (or use existing)
npm install
npx dotenv -e .env.test -- npx prisma generate
npx dotenv -e .env.test -- npm run generate:sdk
npx dotenv -e .env.test -- npx next dev -p 3100
```

## Rollback

In Render dashboard → Deploys → find the last working deploy → "Rollback to this deploy"
