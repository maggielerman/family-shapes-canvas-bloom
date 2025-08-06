#!/usr/bin/env bash
set -euo pipefail

# --- config (edit email if you want) ---
GIT_NAME="Maggie Lerman"
GIT_EMAIL="${GIT_EMAIL:-}"   # set this env var or the script will prompt

die(){ echo "❌ $*" >&2; exit 1; }
ok(){  echo "✅ $*"; }
info(){ echo "— $*"; }

command -v gh >/dev/null 2>&1 || die "GitHub CLI (gh) not found. Install with: brew install gh"
command -v git >/dev/null 2>&1 || die "git not found."

# Ensure we're inside a git repo
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Run this from your repo root."

# Detect current branch
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ -n "$BRANCH" ] || die "Couldn't determine current branch."

# Set git identity (optional but recommended)
if [ -z "${GIT_EMAIL}" ]; then
  # Try to read current git email; if empty, prompt
  CURRENT_EMAIL="$(git config user.email || true)"
  if [ -z "$CURRENT_EMAIL" ]; then
    read -rp "Enter the email tied to GitHub user 'maggielerman': " GIT_EMAIL
  else
    GIT_EMAIL="$CURRENT_EMAIL"
  fi
fi

info "Setting git identity to: $GIT_NAME <$GIT_EMAIL>"
git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

# Logout any existing session to avoid wrong user (e.g., magg1elerman)
info "Signing out any existing GitHub CLI session…"
gh auth logout -h github.com -p || true

# Login as maggielerman (HTTPS via web flow)
info "Logging in to GitHub CLI as 'maggielerman' via HTTPS (web)…"
gh auth login -h github.com -p https --web

# Confirm
info "Checking auth status…"
gh auth status || die "GitHub auth failed. Make sure you completed the browser login."

# Make sure remote uses HTTPS (works with gh token auth)
REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
if [ -z "$REMOTE_URL" ]; then
  die "No 'origin' remote found. Add one first: git remote add origin https://github.com/maggielerman/<repo>.git"
fi

if [[ "$REMOTE_URL" != https://github.com/* ]]; then
  info "Switching origin to HTTPS (so gh token works)…"
  # Convert SSH -> HTTPS
  # git@github.com:user/repo.git -> https://github.com/user/repo.git
  CLEAN_URL="https://github.com/${REMOTE_URL#git@github.com:}"
  CLEAN_URL="${CLEAN_URL%.git}.git"
  git remote set-url origin "$CLEAN_URL"
fi

# Clear stale macOS Keychain HTTPS creds (safe; gh will provide token)
info "Clearing any stale macOS Keychain entry for github.com (HTTPS)…"
if command -v git-credential-osxkeychain >/dev/null 2>&1; then
  printf "protocol=https\nhost=github.com\n\n" | git credential-osxkeychain erase || true
fi

# Push the current branch
info "Pushing branch '$BRANCH' to origin…"
git push -u origin "$BRANCH"

ok "Done. You’re authenticated with gh and your branch is pushed."
echo "Tip: future pushes won’t require re-login. If they do, rerun this script."