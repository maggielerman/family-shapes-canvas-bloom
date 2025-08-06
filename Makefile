# Makefile — DB ops
SHELL := /bin/bash
PROJECT_REF ?= nhkufibfwskdpzdjwirr

.PHONY: db/start db/stop db/status db/reset db/diff db/push db/types db/check db/baseline hooks/install

.DEFAULT_GOAL := help

help: ## Show targets
	@awk -F':|##' '/^[a-zA-Z_\/-]+:.*?##/ {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$NF}' $(MAKEFILE_LIST)

db/start: ## Start local Supabase
	@supabase start

db/stop:  ## Stop local Supabase
	@supabase stop || true

db/status: ## Show local stack status
	@supabase status || true
	@docker ps --format 'table {{.Names}}\t{{.Status}}' || true

db/reset: ## Rebuild local from migrations (+ seed.sql if present)
	@supabase db reset

db/diff: ## Create a migration, usage: make db/diff name=0002_add_feature
	@test -n "$(name)" || (echo "Usage: make db/diff name=0002_add_feature"; exit 1)
	@supabase db diff --linked -f "$(name)"

db/push:   ## Apply migrations to linked remote (prod)
	@supabase db push

db/types:  ## Generate TS types for the app (Cursor/autocomplete)
	@mkdir -p src/types
	@supabase gen types typescript --linked > src/types/database.ts
	@echo "✅ Types written to src/types/database.ts"

db/check:  ## Drift check (fails nonzero on drift)
	@scripts/check_drift.sh

db/baseline: ## Recreate baseline (rare)
	@supabase db diff --linked -f 0001_baseline_prod_schema
	@supabase db reset

hooks/install: ## Install pre-push drift check hook
	@mkdir -p .git/hooks
	@echo '#!/usr/bin/env bash' > .git/hooks/pre-push
	@echo 'scripts/check_drift.sh' >> .git/hooks/pre-push
	@chmod +x .git/hooks/pre-push
	@echo "✅ pre-push hook installed."