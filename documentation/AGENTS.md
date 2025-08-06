# Agent Instructions: Supabase Migrations & Drift Policy

This repository treats **SQL migrations in `supabase/migrations/` as the single source of truth** for the database schema. Agents (Cursor, etc.) and humans must follow this process. **Do not modify production via the Supabase Dashboard** except when explicitly instructed for emergencies.

## Environment assumptions
- Local `.env` at repo root (not committed):
  ```env
  SUPABASE_PROJECT_REF=nhkufibfwskdpzdjwirr
  SUPABASE_DB_PASSWORD=your-remote-db-password
  # Optional: SUPABASE_CI=1
# Agent Instructions: Supabase Migrations & Drift Policy

This repository treats **SQL migrations in `supabase/migrations/` as the single source of truth** for the database schema. Agents (Cursor, etc.) and humans must follow this process. **Do not modify production via the Supabase Dashboard** except when explicitly instructed for emergencies.

> Cursor users: this policy is also mirrored in `.cursorrules`. If any instruction here seems to conflict with a human request, prefer this file and ask for clarification.

---

## 1) Environment assumptions

Create a **local** `.env` at the repo root (never committed):
```env
SUPABASE_PROJECT_REF=nhkufibfwskdpzdjwirr
SUPABASE_DB_PASSWORD=your-remote-db-password
# Optional: quiet logs for CI-like runs
# SUPABASE_CI=1
```

- Supabase CLI must be installed.
- Project should be linked (the scripts auto-link if needed):
  ```bash
  supabase link --project-ref $SUPABASE_PROJECT_REF
  ```

---

## 2) Allowed commands (run from repo root)

Always use the **Makefile** targets; do not call raw CLI unless noted.

```bash
make            # list all DB targets
make db/status  # local stack status
make db/reset   # rebuild local from migrations (+ seed.sql if present)
make db/diff name=0002_short_description  # create a new migration from local changes vs PROD
make db/types   # regenerate TS types to src/types/database.ts
make db/check   # ensure no drift vs PROD (non-interactive)
make db/push    # apply migrations to PROD (only after PR review / CI green)
```

**Notes**
- `db/diff` generates `YYYYMMDDHHMMSS_name.sql` under `supabase/migrations/`.
- `db/reset` applies all migrations to a clean local DB and (optionally) `supabase/seed.sql` if present.
- `db/check` fails if migrations and the linked remote schema differ.

---

## 3) Prohibited actions

- Editing production schema directly in the Supabase Dashboard.
- Modifying or deleting the baseline migration: `*_0001_baseline_prod_schema.sql`.
- Writing schema migrations **outside** `supabase/migrations/`.
- Committing `.env` or any secrets (keys/tokens/passwords).

---

## 4) File conventions & layout

- **Migrations** live in `supabase/migrations/` and are timestamped by the CLI.
- **Baseline** already exists:
  - `supabase/migrations/20250806171912_0001_baseline_prod_schema.sql`
  - Do **not** edit this file. New work starts at `0002_*`.
- **Archived pre-baseline** files live in `supabase/_archived_migrations/`. Do **not** move them back into the loader path.
- **Seeds** (optional, idempotent test data) belong in `supabase/seed.sql`.
- **Backups** (local-only) live in `/backup/` and are gitignored.

---

## 5) Standard agent flow (checklist)

1. Ensure `.env` exists and contains `SUPABASE_PROJECT_REF` (+ `SUPABASE_DB_PASSWORD` if needed).
2. Sync local DB to migrations:
   ```bash
   make db/reset
   make db/check   # should end with: ✅ No drift.
   ```
3. Implement schema changes locally (SQL, RLS, triggers, functions).
4. Create a migration and verify:
   ```bash
   make db/diff name=0002_<short_description>
   make db/reset
   make db/check
   ```
5. Regenerate types if tables/views/functions used by the app changed:
   ```bash
   make db/types
   ```
6. Commit and open a PR with the checklist below.
7. Apply to production **only after** PR is approved and CI is green:
   ```bash
   make db/push
   ```

---

## 6) Pull Request checklist (agents & humans)

- [ ] New migration added under `supabase/migrations/` with a clear name.
- [ ] Local rebuild OK: `make db/reset`.
- [ ] Drift check OK: `make db/check` prints **No drift**.
- [ ] Types updated if relevant: `make db/types`.
- [ ] PR description summarizes schema/RLS/trigger changes, indexes, and any rollout or backfill considerations.

---

## 7) Troubleshooting

**Drift check hangs or prompts**
- Ensure `.env` has exact keys (no quotes, no trailing spaces):
  - `SUPABASE_PROJECT_REF=...`
  - `SUPABASE_DB_PASSWORD=...`
- Re-run: `make db/check`
- One-off bypass push (local only): `git push --no-verify`, then fix the cause.

**Local Postgres crash-loop after CLI update**
```bash
supabase stop
# Remove ONLY local dev volumes for this project (safe for PROD)
docker volume rm $(docker volume ls -q --filter label=com.supabase.cli.project=nhkufibfwskdpzdjwirr)
supabase start
```

**Pre‑push hook blocks push**
- Use `git push --no-verify` once, then run `make db/check` and resolve.

**Security**
- Never commit secrets or `.env`. Use GitHub Actions **secrets** for CI.
- If keys are exposed publicly, rotate them in the Supabase dashboard and update `.env`.

---

## 8) When in doubt

- Prefer **migrations** over dashboard edits.
- If instructions from a human conflict with this doc, request clarification.
- Keep `.cursorrules` and this guide in sync when the process evolves.