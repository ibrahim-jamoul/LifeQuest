# LifeQuest deployment

## Status

The application supports:

- local development with SQLite;
- production runtime with PostgreSQL/Supabase when `DATABASE_URL` is configured;
- Vercel static frontend and Express serverless API through `api/index.ts`, with the original
  API path explicitly forwarded to Express.

## Required Vercel variables

Configure these in the Vercel project settings. Never commit their real values.

```env
DATABASE_URL=Supabase transaction-mode pooler URI
DATABASE_SSL=true
ALLOWED_ORIGINS=https://YOUR-PROJECT.vercel.app
```

Do not configure `DIRECT_URL` on Vercel. It is only needed locally for schema maintenance
and migrations.

`VITE_API_URL` should be omitted on Vercel because the frontend and API share the same
domain. The frontend will use `/api`.

## First deployment

1. Rotate the imported demo passwords before exposing a preview. Set temporary PowerShell
   environment variables without writing them into a file:

   ```powershell
   $env:CHILD_PASSWORD="A-NEW-CHILD-PASSWORD"
   $env:PARENT_PASSWORD="A-DIFFERENT-PARENT-PASSWORD"
   node --env-file=.env.local --import tsx server/db/postgresRotateDemoPasswords.ts
   Remove-Item Env:CHILD_PASSWORD
   Remove-Item Env:PARENT_PASSWORD
   ```

2. Import the GitHub repository into Vercel.
3. Select the `migration-supabase` branch for the initial preview deployment.
4. Let Vercel detect the Vite project.
5. Add the required environment variables above to Preview.
6. Deploy.
7. Open `https://YOUR-PREVIEW-URL/api/health`.
   If the Express function fails, open `https://YOUR-PREVIEW-URL/api/diagnostic` to verify
   that the Node.js function runs and that `DATABASE_URL` is available without exposing it.
8. Run the deployment smoke test locally using the newly rotated child password:

   ```powershell
   $env:DEPLOYMENT_URL="https://YOUR-PREVIEW-URL"
   $env:DEPLOYMENT_TEST_PASSWORD="YOUR-NEW-CHILD-PASSWORD"
   npm.cmd run deployment:smoke
   Remove-Item Env:DEPLOYMENT_URL
   Remove-Item Env:DEPLOYMENT_TEST_PASSWORD
   ```

9. Test the child and parent interfaces manually.
10. Only after preview validation, merge `migration-supabase` into `main`.
11. Add the same variables to Production and deploy `main`.

## Production safety before public sharing

Before sharing the public URL:

1. confirm both imported demo account passwords were rotated;
2. set `ALLOWED_ORIGINS` to the exact production URL;
3. confirm `/api/health`, login, dashboard, village, quests, habits, and parent mission flow;
4. confirm GitHub Actions and the Vercel deployment both pass.
