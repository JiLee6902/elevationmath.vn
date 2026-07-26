# Deployment

## Render backend

Use the Blueprint flow with `render.yaml` at the repository root.

The Blueprint creates:

- `elevation-math-api`: Docker web service.
- `elevation-math-db`: Render Postgres.

Render runs database migrations before starting the service:

```sh
node node_modules/drizzle-kit/bin.cjs migrate && node server.js
```

On the first successful deploy, Render runs:

```sh
node scripts/seed-production.mjs
```

The first seed creates the default admin, program groups, document types for grade 1-2, and sample documents only when the database has no documents yet.

Required Render env values to fill in manually:

- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_APP_URL`
- `S3_ENDPOINT`
- `S3_PUBLIC_ENDPOINT`
- `S3_REGION`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`

## Vercel frontend

Import the same GitHub repository into Vercel.

Required Vercel env values:

- `DATABASE_URL`: use the External Database URL from Render Postgres.
- `API_ORIGIN`: the Render backend URL, for example `https://elevation-math-api.onrender.com`.
- `NEXT_PUBLIC_APP_URL`: the Vercel production URL.
- `S3_ENDPOINT`
- `S3_PUBLIC_ENDPOINT`
- `S3_REGION`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`

When `API_ORIGIN` is set, `next.config.ts` rewrites `/api/*` and `/storage/*` from Vercel to the Render backend.
