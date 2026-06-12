# Supabase migration

LifeQuest keeps its Express API as the only application data-access layer.

Project settings:

- Data API: enabled
- Automatically expose new tables: disabled
- Automatic RLS: enabled

The migration also explicitly enables RLS and revokes direct access from the `anon` and
`authenticated` Data API roles. This is intentional: browser clients must call the
LifeQuest Express API instead of querying tables directly.

## Connection

Copy the Supabase **Transaction pooler** URI from the project Connect panel and store it as:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
DATABASE_SSL=true
```

Do not commit the real value.

## Apply the schema

Preferred approach after installing and authenticating the Supabase CLI:

```powershell
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The migrations are applied in filename order:

```text
supabase/migrations/202606110001_initial_lifequest_schema.sql
supabase/migrations/202606120001_advanced_phase.sql
```

The advanced migration must be applied before deploying code that reads child avatars or
persists browser reminder preferences.

## Migration order

1. Apply and verify the PostgreSQL schema.
2. Verify the connection, RLS, and advanced columns:

   ```powershell
   node --env-file=.env.local --import tsx server/db/postgresVerify.ts
   ```

3. Run a reversible read/write smoke test:

   ```powershell
   node --env-file=.env.local --import tsx server/db/postgresSmokeTest.ts
   ```

4. Copy the existing local SQLite data into Supabase:

   ```powershell
   node --env-file=.env.local --import tsx server/db/postgresMigrateData.ts
   ```

5. Run the verification command again and confirm that the expected tables are no longer empty.
6. Run the Supabase-backed Express API integration:

   ```powershell
   node --env-file=.env.local --import tsx server/db/postgresApiIntegration.ts
   ```

7. Confirm the integration prints `Supabase-backed Express API integration passed.`
8. Configure and deploy the production services.

The verification must print `Advanced columns: 3/3`. If it does not, run `supabase db push`
before deploying.

`DIRECT_URL` is used by verification and migration commands when available. `DATABASE_URL`
is reserved for the application runtime and should use the transaction-mode pooler.

## Verified migration snapshot

On June 11, 2026:

- all 27 expected tables were present with RLS enabled;
- the reversible read/write smoke test passed;
- the local SQLite data import completed successfully;
- a post-import verification confirmed the expected row counts.

The Express application runtime now selects PostgreSQL whenever `DATABASE_URL` is present
and keeps SQLite as the local/test fallback. GitHub Actions applies the PostgreSQL schema,
imports the demo seed, and runs the API integration against a temporary PostgreSQL service.
