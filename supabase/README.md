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
2. Replace the SQLite database adapter and SQLite-specific SQL in the Express API.
3. Add a PostgreSQL seed/import script.
4. Run the complete integration suite against Supabase.
5. Configure Vercel environment variables.

