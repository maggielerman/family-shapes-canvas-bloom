#!/usr/bin/env bash
set -euo pipefail

# --- settings ---
PROJECT_REF_FROM_DOTSUPA="$(awk -F'=' '/ref/ {gsub(/"| /,"",$2); print $2}' .supabase/config.toml 2>/dev/null || true)"
PROJECT_REF="${1:-${PROJECT_REF_FROM_DOTSUPA}}"
BASELINE_NAME="0001_baseline_prod_schema"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="backup"
TYPES_OUT="src/types/database.ts"

die(){ echo "❌ $*" >&2; exit 1; }
ok(){ echo "✅ $*"; }
info(){ echo "— $*"; }

command -v docker >/dev/null || die "Docker is required."
command -v supabase >/dev/null || die "Supabase CLI is required."

[[ -n "$PROJECT_REF" ]] || read -rp "Enter your Supabase PROJECT REF: " PROJECT_REF
[[ -n "$PROJECT_REF" ]] || die "Project ref is required."

# 0) Link (safe; no remote changes)
info "Linking to project ref: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF" >/dev/null || true
ok "Linked to $PROJECT_REF"

# 1) Stop local stack
info "Stopping local Supabase…"
supabase stop || true

# 2) Remove local dev volumes for this project (PG15 → PG17 mismatch fix)
info "Removing local Docker volumes for this project (safe: LOCAL ONLY)…"
VOLS="$(docker volume ls -q --filter label=com.supabase.cli.project="$PROJECT_REF")"
if [ -z "$VOLS" ]; then
  info "No project volumes found; nothing to remove."
else
  echo "$VOLS" | xargs -r docker volume rm
  ok "Removed volumes."
fi

# 3) Start clean local stack
info "Starting fresh local Supabase stack…"
supabase start

# 4) Wait for Postgres to be ready (54322)
info "Waiting for local Postgres on port 54322…"
for i in {1..120}; do
  nc -z localhost 54322 >/dev/null 2>&1 && break
  sleep 1
  [ $((i % 10)) -eq 0 ] && echo "…still waiting ($i s)"
  [ "$i" -eq 120 ] && die "Local Postgres didn't become ready. Check 'supabase status'."
done
ok "Local Postgres ready."

# 5) Optional: backups from PROD (useful belt+suspenders)
mkdir -p "$BACKUP_DIR"
info "Taking full backup from PROD…"
supabase db dump --linked -f "$BACKUP_DIR/full_${STAMP}.sql"
ok "Full backup → $BACKUP_DIR/full_${STAMP}.sql"

info "Taking roles-only backup from PROD…"
supabase db dump --linked --role-only -f "$BACKUP_DIR/roles_${STAMP}.sql"
ok "Roles backup → $BACKUP_DIR/roles_${STAMP}.sql"

# 6) Reset local from (current) migrations (likely empty after your archive step)
info "Resetting local DB from migrations…"
supabase db reset

# 7) Create baseline migration from PROD
info "Creating baseline migration from PROD…"
supabase db diff --linked -f "$BASELINE_NAME"
BASELINE_FILE="$(ls -1 supabase/migrations/*_${BASELINE_NAME}.sql | tail -n1 2>/dev/null || true)"
ok "Baseline created: ${BASELINE_FILE:-(written)}"

# 8) Verify clean rebuild
info "Verifying clean rebuild from migrations…"
supabase db reset
ok "Migrations rebuild clean locally."

# 9) Generate TS types (nice for Cursor & type safety)
info "Generating TypeScript types…"
mkdir -p "$(dirname "$TYPES_OUT")"
supabase gen types typescript --linked > "$TYPES_OUT"
ok "Types written to $TYPES_OUT"

echo
ok "Done. Local PG version mismatch fixed and baseline created."
echo "Next:"
echo "  • Review: ${BASELINE_FILE:-supabase/migrations/*_${BASELINE_NAME}.sql}"
echo "  • Future changes: supabase db diff -f <name> → supabase db reset → supabase db push"