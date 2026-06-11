# LifeQuest Dashboard

LifeQuest Dashboard is a local-first cozy progression village for children and their linked parent.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Node.js + Express
- SQLite locally and PostgreSQL/Supabase in production
- Vitest

The API and database are separated from the UI so SQLite can later be replaced by PostgreSQL without restructuring the frontend.

## Run locally

Requirements: Node.js 24+ and npm.

```bash
npm install
npm run db:init
npm run db:seed
npm run dev
```

- Web app: `http://localhost:3000`
- API: `http://localhost:4000/api`
- Health check: `http://localhost:4000/api/health`

On PowerShell systems where `npm.ps1` is disabled, use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run db:init
npm.cmd run db:seed
npm.cmd run dev
```

## Commands

```bash
npm run dev       # Run web and API together
npm run build     # Type-check and build the frontend
npm run db:init   # Initialize the SQLite database
npm run db:seed   # Add the linked child/parent demo household
npm test          # Run basic tests
```

## Structure

```text
src/
  components/     Reusable UI components
  config/         Navigation and domain configuration
  layouts/        Responsive application shell
  lib/            Frontend API helpers
  pages/          Dashboard and feature pages
  types/          Shared frontend domain types
server/
  db/             SQLite connection, schema, initialization
  middleware/     Express middleware
  routes/         API routes
  services/       Domain logic such as gamification
tests/            Basic domain tests
```

## Database model

The schema is in `server/db/schema.sql` and includes:

- Users and local profile settings
- Goals, milestones, tasks, habits, and habit logs
- Projects, notes, weekly/monthly reviews
- XP events, achievements, and weekly challenges
- Life areas and weekly focus priorities

The idempotent development seed creates:

- Child: `child@lifequest.local`
- Parent: `parent@lifequest.local`
- Password for both: `lifequest123`
- Five habits, five quests, three discovery domains, one parent-child mission, and eight village zones

## API

All protected endpoints use `Authorization: Bearer <token>` from `POST /api/auth/login`.

- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `GET/POST /api/habits`
- `PUT/DELETE /api/habits/:id`
- `POST /api/habits/:id/log`, `GET /api/habits/:id/logs`
- `GET/POST /api/quests`
- `PUT/DELETE /api/quests/:id`
- `PATCH /api/quests/:id/complete`
- `GET /api/dashboard/today`
- `GET /api/village/state`
- `GET/POST/PUT/DELETE /api/goals`, `PATCH /api/goals/:id/complete`
- `GET/POST/PUT/DELETE /api/projects`, project milestones and notes
- `GET/POST /api/reviews`
- `GET /api/achievements`
- `GET/POST /api/missions`, `PATCH /api/missions/:id/submit`, `PATCH /api/missions/:id/validate`
- `GET /api/parent/dashboard`, `GET /api/parent/children`
- `GET/PATCH /api/discovery`
- `GET/POST/DELETE /api/focus`, plus weekly challenge creation and progress
- `GET/PUT /api/life-areas`
- `GET/POST/PATCH /api/campaigns`
- `GET /api/insights`
- `GET/PUT /api/preferences`
- `GET/PATCH /api/notifications`

The database runner applies versioned SQL files from `server/db/migrations` and records them
in `schema_migrations`.

## Current milestone

Weeks 1-10 provide:

- Local child and parent authentication with protected role-specific routes
- Daily quests, habits, XP, streaks, and real village state
- Goals, goal details, milestones, notes, projects, and reviews
- Automatic MVP achievements with one-time XP rewards
- Parent-child missions created by a parent, submitted by the child, then validated by the parent
- Cozy internal pages and an immersive SVG village homepage
- Versioned SQLite migrations, idempotent seed data, API integration tests, and strict TypeScript build
- Real progression for all village zones with non-regressing visual rewards and land unlocks
- Age-adapted Discovery Cove challenges, weekly focus priorities, and weekly challenges
- Life-area check-ins and a 12-chapter school campaign connected to Town Hall
- XP and habit charts, local reminders, onboarding, and keyboard-accessible SVG buildings
- Week 11 local stabilization: notification center, React error boundary, level 1-3 building polish, and 17 passing tests

## Island hub architecture

The island homepage lives in `src/features/island`. Its environment is fully coded with
layered React/SVG components in `src/features/island/scene`: ocean, organic terrain, river,
paths, bridges, vegetation, buildings, labels, and ambient effects. Zone configuration is
isolated in `data.ts`; real progress is loaded from `GET /api/village/state` and daily
actions are loaded from `GET /api/dashboard/today`.

Zone positions, building types, label positions, colors, progress, links, and recommended
actions are configuration data rather than deeply hardcoded UI.

The `/` route uses `ImmersiveHomeLayout`, so the village is the primary navigation surface
without a sidebar. Secondary routes continue to use `AppShell`, and the compact village menu
provides contextual access to those internal pages.

For the exhaustive current-state audit, production limitations, and handoff notes, see
`PROJECT_STATE_HANDOFF.md`.

For the preview and production deployment procedure, see `DEPLOYMENT.md`.
