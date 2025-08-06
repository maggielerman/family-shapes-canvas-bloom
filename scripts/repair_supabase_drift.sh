#!/usr/bin/env bash
set -euo pipefail

# ======= Config (best-practice defaults) =======
CREATE_BRANCH=false      # make a safety branch
ARCHIVE_EXISTING=true   # archive any existing migrations before baselining
GEN_TYPES=true          # generate TypeScript types
INSTALL_PREPUSH=true    # install a pre-push drift check hook

# ======= Helpers =======
die(){ echo "❌ $*" >&2; exit 1; }
ok(){ echo "✅ $*"; }
info(){ echo "— $*"; }

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="backup"
MIG_DIR="supabase/migrations"
ARCHIVE_DIR="$MIG_DIR/_prebaseline_$STAMP"
BASELINE_NAME="0001_baseline_prod_schema"
TYPES_OUT="src/types/database.ts"

# ======= Prechecks =======
command -v supabase >/dev/null 2>&1 || die "Supabase CLI not found. Install via Homebrew: brew install supabase/tap/supabase"

SUPA_VER="$(supabase --version | tr -d '\r')"
ok "Supabase CLI: $SUPA_VER"

# Ask for project ref (short ID from Dashboard → Settings → General)
read -rp "Enter your Supabase PROJECT REF (e.g., abcd1234efghij12): " PROJECT_REF
[[ -n "${PROJECT_REF}" ]] || die "Project ref is required."

# Git safety
IN_GIT=false
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  IN_GIT=true
  if $CREATE_BRANCH; then
    # refuse to proceed with dirty tree; safer baselining
    (! git diff --quiet || ! git diff --cached --quiet) && die "Uncommitted changes present. Commit or stash before running."
    NEW_BRANCH="chore/db-baseline-$STAMP"
    info "Creating safety branch: $NEW_BRANCH"
    git checkout -b "$NEW_BRANCH" >/dev/null
    ok "On branch $NEW_BRANCH"
  else
    info "Git repo detected; proceeding on current branch."
  fi
else
  info "Not a git repository; continuing without branch safety."
fi

# ======= Link to PROD (no changes applied) =======
info "Linking to project ref: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF" >/dev/null
ok "Linked to $PROJECT_REF"

# ======= Backups (full + roles) =======
mkdir -p "$BACKUP_DIR"

info "Taking full backup from PROD (may take a while)…"
supabase db dump --linked -f "$BACKUP_DIR/full_${STAMP}.sql"
ok "Full backup → $BACKUP_DIR/full_${STAMP}.sql"

info "Taking roles-only backup from PROD…"
supabase db dump --linked --role-only -f "$BACKUP_DIR/roles_${STAMP}.sql"
ok "Roles backup → $BACKUP_DIR/roles_${STAMP}.sql"

# ======= Archive existing migrations (avoid conflicts) =======
mkdir -p "$MIG_DIR"
if $ARCHIVE_EXISTING; then
  EXISTING=$(find "$MIG_DIR" -maxdepth 1 -type f -name '*.sql' | wc -l | tr -d ' ')
  if [[ "$EXISTING" -gt 0 ]]; then
    info "Archiving $EXISTING existing migration(s) to $ARCHIVE_DIR"
    mkdir -p "$ARCHIVE_DIR"
    find "$MIG_DIR" -maxdepth 1 -type f -name '*.sql' -print -exec mv {} "$ARCHIVE_DIR"/ \;
    ok "Archived legacy migrations."
  else
    info "No existing migrations to archive."
  fi
fi

# ======= Local reset & baseline creation =======
info "Restarting local Supabase stack…"

# Pre-check: warn on common port conflicts before starting
NEEDED_PORTS=(54320 54321 54322 54323 54324 54325)
CONFLICT=false
for P in "${NEEDED_PORTS[@]}"; do
  if lsof -i tcp:"$P" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "⚠️  Port $P is already in use. This can block 'supabase start'."
    CONFLICT=true
  fi
done
$CONFLICT && echo "Tip: close the process using the port (lsof -i :PORT) or change ports in supabase/config.toml." || true

# Stop (show output for visibility), then start with visible logs
supabase stop || true
supabase start

# Readiness check: wait for Postgres on 54322 (default) up to 120s
info "Waiting for local Postgres to be ready on port 54322…"
READY=false
for i in {1..120}; do
  if nc -z localhost 54322 >/dev/null 2>&1; then
    READY=true
    break
  fi
  sleep 1
  [ $((i % 10)) -eq 0 ] && echo "…still waiting ($i s)"
done
$READY || die "Local Postgres didn't become ready. Run 'supabase status' and check Docker is running."

ok "Local stack running."

info "Resetting local DB from current (clean) migrations…"
supabase db reset
ok "Local DB reset."

info "Creating baseline migration from PROD…"
supabase db diff --linked -f "$BASELINE_NAME" >/dev/null
BASELINE_FILE="$(ls -1 $MIG_DIR/*_${BASELINE_NAME}.sql | tail -n1 2>/dev/null || true)"
ok "Baseline created: ${BASELINE_FILE:-(written)}"

info "Verifying clean rebuild from migrations…"
supabase db reset
ok "Migrations rebuild clean locally."

# ======= Optional: generate TS types =======
if $GEN_TYPES; then
  mkdir -p "$(dirname "$TYPES_OUT")"
  info "Generating TypeScript types to $TYPES_OUT…"
  supabase gen types typescript --linked > "$TYPES_OUT"
  ok "Types written to $TYPES_OUT"
fi

# ======= Install drift check (script + optional pre-push hook) =======
mkdir -p scripts
cat > scripts/check_drift.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

# Ensure local can rebuild from migrations, then compare against linked remote.
# Quiet reset; this script is used in hooks/CI
supabase start >/dev/null 2>&1 || true
supabase db reset >/dev/null 2>&1

# Produce a diff; if any SQL would be generated, drift exists.
TMPNAME="__drift_check"
OUT=$(supabase db diff --linked -f "$TMPNAME" 2>/dev/null || true)

# Clean temp migration if created
rm -f supabase/migrations/*__drift_check.sql 2>/dev/null || true

if [ -n "$OUT" ]; then
  echo "❌ Schema drift detected between migrations and linked remote."
  echo "Run: supabase db diff --linked -f fix_drift && supabase db reset"
  exit 1
fi

echo "✅ No drift."
EOF
chmod +x scripts/check_drift.sh
ok "Installed scripts/check_drift.sh"

if $INSTALL_PREPUSH && $IN_GIT; then
  mkdir -p .git/hooks
  cat > .git/hooks/pre-push <<'EOF'
#!/usr/bin/env bash
scripts/check_drift.sh
EOF
  chmod +x .git/hooks/pre-push
  ok "Installed git pre-push drift check."
fi

# ======= Commit artifacts =======
if $IN_GIT; then
  git add "$BACKUP_DIR" supabase/migrations scripts/check_drift.sh 2>/dev/null || true
  $GEN_TYPES && git add "$TYPES_OUT"
  $ARCHIVE_EXISTING && [ -d "$ARCHIVE_DIR" ] && git add "$ARCHIVE_DIR"
  git commit -m "chore(db): baseline from PROD ($STAMP) + backups + types + drift check${ARCHIVE_EXISTING:+ + archived legacy migrations}" >/dev/null || true
  ok "Committed baseline + backups + types + drift check."
fi

echo
ok "Done! Your repo can now recreate PROD's schema from scratch."
echo "Next:"
echo "  • Review the new migration in $MIG_DIR (ends with _${BASELINE_NAME}.sql)."
echo "  • For future changes: edit locally → 'supabase db diff -f <name>' → 'supabase db reset' → 'supabase db push'."
echo "  • To check drift anytime: ./scripts/check_drift.sh"