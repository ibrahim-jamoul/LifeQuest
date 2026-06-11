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

The initial schema is in:

```text
supabase/migrations/202606110001_initial_lifequest_schema.sql
```

## Migration order

1. Apply and verify the PostgreSQL schema.
2. Verify the connection and RLS:

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
6. Replace the SQLite runtime adapter and SQLite-specific SQL in the Express API.
7. Run the complete integration suite against Supabase.
8. Configure and deploy the production services.

`DIRECT_URL` is used by verification and migration commands when available. `DATABASE_URL`
is reserved for the application runtime and should use the transaction-mode pooler.

## Verified migration snapshot

On June 11, 2026:

- all 27 expected tables were present with RLS enabled;
- the reversible read/write smoke test passed;
- the local SQLite data import completed successfully;
- a post-import verification confirmed the expected row counts.

The Express application runtime still uses SQLite. Do not deploy it as a Supabase-backed
production API until its synchronous database calls and SQLite-specific SQL are converted.
