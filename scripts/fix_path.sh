#!/usr/bin/env bash
set -euo pipefail

STAMP="$(date +%F-%H%M%S)"
HBIN="/opt/homebrew/bin"
ZRC="$HOME/.zshrc"
ZPRO="$HOME/.zprofile"
ZENV="$HOME/.zshenv"

backup() {
  local f="$1"
  [ -f "$f" ] && cp "$f" "$f.bak.$STAMP" || true
}

# 1) Backups
backup "$ZRC"
backup "$ZPRO"
backup "$ZENV"

# 2) Remove any Homebrew PATH lines outside .zshrc (keep config in one place)
for f in "$ZPRO" "$ZENV"; do
  if [ -f "$f" ]; then
    # macOS sed requires the empty string after -i
    sed -i '' '/homebrew\/bin/d' "$f"
  fi
done

# 3) Normalize ~/.zshrc: remove duplicates, then add the canonical lines
touch "$ZRC"
sed -i '' '/homebrew\/bin/d' "$ZRC"

# Add zsh PATH de-dup (once)
if ! grep -q 'typeset -U path PATH' "$ZRC"; then
  {
    echo ''
    echo '# Keep PATH entries unique (zsh)'
    echo 'typeset -U path PATH'
  } >> "$ZRC"
fi

# Add a single canonical Homebrew PATH export (once)
if ! grep -q 'export PATH="/opt/homebrew/bin:$PATH"' "$ZRC"; then
  {
    echo ''
    echo '# Homebrew (Apple Silicon)'
    echo 'export PATH="/opt/homebrew/bin:$PATH"'
  } >> "$ZRC"
fi

echo "✅ Cleaned PATH config."
echo "🗂️  Backups created with .bak.$STAMP suffix (if files existed)."
echo "🔁 Reloading your shell..."

# 4) Start a fresh login zsh so the new PATH & de-dup take effect
exec zsh -l