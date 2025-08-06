#!/usr/bin/env bash
set -euo pipefail

# Load .env if present
if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

die(){ echo "❌ $*" >&2; exit 1; }
ok(){  echo "✅ $*"; }
log(){ [ -z "${SUPABASE_CI:-}" ] && echo "— $*" || true; }

command -v supabase >/dev/null 2>&1 || die "Supabase CLI not found."

# Ensure linked; if not, link using env
if [ ! -f .supabase/config.toml ]; then
  [ -n "${SUPABASE_PROJECT_REF:-}" ] || die "Not linked and SUPABASE_PROJECT_REF not set."
  log "Linking to project ref: $SUPABASE_PROJECT_REF"
  supabase link --project-ref "$SUPABASE_PROJECT_REF" >/dev/null
fi

# Make sure local can rebuild from migrations (quiet in CI)
supabase start >/dev/null 2>&1 || true
supabase db reset >/dev/null 2>&1 || true  # quiet reset; used in hooks/CI

# Compare migrations vs. linked remote; any output OR generated file == drift
TMP="__drift_check"

run_diff () {
  # Build direct DB URL when creds are available to avoid interactive prompts
  local CMD
  if [ -n "${SUPABASE_DB_PASSWORD:-}" ] && [ -n "${SUPABASE_PROJECT_REF:-}" ]; then
    export PGPASSWORD="$SUPABASE_DB_PASSWORD"
    local DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres?sslmode=require"
    CMD="supabase db diff --db-url \"$DB_URL\" -f \"$TMP\""
  else
    # Fallback to linked project (may prompt if no creds)
    CMD="supabase db diff --linked -f \"$TMP\""
  fi

  if [ -n "${SUPABASE_CI:-}" ]; then
    eval "$CMD 2>/dev/null" || true
  else
    eval "$CMD" || true
  fi
}

OUT="$(run_diff)"

# Prefer file-based detection (some versions print status text even with no changes)
DRIFT_FILE="$(ls -1 supabase/migrations/*__drift_check.sql 2>/dev/null | head -n1 || true)"
HAS_DRIFT=""

if [ -n "$DRIFT_FILE" ] && [ -s "$DRIFT_FILE" ]; then
  HAS_DRIFT="yes"
elif [ -n "$OUT" ]; then
  HAS_DRIFT="yes"
fi

# Clean any temp migration the diff might have emitted
rm -f supabase/migrations/*__drift_check.sql 2>/dev/null || true

if [ -n "$HAS_DRIFT" ]; then
  echo "❌ Schema drift detected between migrations and linked remote."
  echo "   Fix: create a migration from PROD diff, then verify:"
  echo "   supabase db diff --linked -f fix_drift && supabase db reset"
  exit 1
fi

ok "No drift."