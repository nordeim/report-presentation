#!/bin/bash
# start_server.sh — Fresh-clone → production server for Nave & Spire
#
# Brings the Next.js journal up on http://localhost:3000 starting from a
# freshly `git clone`d repo (no node_modules, no drizzle DB, no .env.local).
# Handles the full stack:
#   - DATABASE_URL (Postgres) via .env.local / .env.example + docker compose
#   - npm ci (frozen lockfile) with fallback to npm install
#   - DB init via `npm run db:setup` (= generate + migrate + seed, idempotent)
#   - quality gate: typecheck + lint + vitest suite (enforced, fails fast)
#   - build (`next build` — Turbopack, force-dynamic skips DB at build)
#   - standalone start via `npm start` (next start) with correct env sourcing
#   - health check (api/health, api/audit, 6 pages, 404, images)
#
# Usage:  ./start_server.sh          # from repo root
#         bash start_server.sh        # same, no chmod needed
# Idempotent: safe to re-run; kills any prior server on :3000 first.
# Logs:   ./server.log
# PID:    ./server.pid

set -euo pipefail

# ── repo layout ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"
LOG_FILE="$REPO_ROOT/server.log"
PID_FILE="$REPO_ROOT/server.pid"
DB_URL_DEFAULT="postgresql://nave_spire_user:nave_spire_secret@127.0.0.1:5432/nave_spire_dev"
PORT_DEFAULT="3000"
HOST_DEFAULT="0.0.0.0"

# ── helpers ──────────────────────────────────────────────────────────────
log()  { printf "\033[1;34m[start]\033[0m %s\n" "$*"; }
ok()   { printf "\033[1;32m[ok]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*" >&2; }
die()  { printf "\033[1;31m[fail]\033[0m %s\n" "$*" >&2; exit 1; }

have() { command -v "$1" >/dev/null 2>&1; }

# Generate a 64-hex secret (kept for future use; not needed for this codebase today)
gen_secret() {
  if have openssl; then
    openssl rand -hex 32
  else
    hexdump -vn32 -e ' /1 "%02x"' /dev/urandom 2>/dev/null || head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'
  fi
}

# ── 0. prerequisites ─────────────────────────────────────────────────────
check_prereqs() {
  log "Checking prerequisites …"
  have node   || die "node not found — install Node ≥22"
  have npm    || die "npm not found — install npm ≥10"
  have curl   || die "curl not found — install curl"

  local node_maj
  node_maj="$(node -p 'process.versions.node.split(".")[0]')"
  if [[ "$node_maj" -lt 22 ]]; then
    die "Node $node_maj < 22 — upgrade to Node ≥22 (README says ≥22)"
  fi

  if have docker; then
    ok "docker $(docker --version 2>/dev/null | head -n1)"
    if docker compose version >/dev/null 2>&1; then
      ok "docker compose $(docker compose version 2>/dev/null | head -n1)"
    elif have docker-compose; then
      ok "docker-compose $(docker-compose --version 2>/dev/null | head -n1)"
    else
      warn "docker compose not found — managed Postgres alternative assumed (DATABASE_URL must point to a reachable host)"
    fi
  else
    warn "docker not found — assuming managed Postgres (DATABASE_URL must not be nave_spire_dev)"
  fi

  have openssl || warn "openssl not found — gen_secret will use /dev/urandom"
  ok "node $(node --version) / npm $(npm --version) / $(openssl version 2>/dev/null || echo openssl-ok)"
}

# ── 1. env file — ensure .env.local with DATABASE_URL ────────────────────
ensure_env() {
  log "Ensuring .env.local …"

  if [[ -f "$REPO_ROOT/.env.local" ]]; then
    log "  .env.local exists — keeping (will ensure DATABASE_URL)"
  elif [[ -f "$REPO_ROOT/.env.example" ]]; then
    log "  .env.local missing — creating from .env.example"
    cp "$REPO_ROOT/.env.example" "$REPO_ROOT/.env.local"
  else
    die "No env template found (.env.example) — cannot create .env.local"
  fi

  # Ensure DATABASE_URL exists and is non-empty
  local cur=""
  if grep -qE "^DATABASE_URL=" "$REPO_ROOT/.env.local"; then
    cur="$(grep -E "^DATABASE_URL=" "$REPO_ROOT/.env.local" | tail -n1 | cut -d= -f2- | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
  fi

  if [[ -z "$cur" ]]; then
    if grep -qE "^DATABASE_URL=" "$REPO_ROOT/.env.local"; then
      # shellcheck disable=SC2016
      sed -i 's|^DATABASE_URL=.*|DATABASE_URL="'"$DB_URL_DEFAULT"'"|' "$REPO_ROOT/.env.local"
    else
      echo "DATABASE_URL=\"$DB_URL_DEFAULT\"" >> "$REPO_ROOT/.env.local"
    fi
    log "  set DATABASE_URL=$DB_URL_DEFAULT"
  else
    log "  DATABASE_URL present (masked: $(echo "$cur" | sed -E 's|://[^:]+:[^@]+@|://***:***@|'))"
  fi

  # Validate non-empty
  local check
  check="$(grep -E "^DATABASE_URL=" "$REPO_ROOT/.env.local" | tail -n1 | cut -d= -f2- | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//')"
  if [[ -z "$check" ]]; then
    die "DATABASE_URL still empty after ensure — check $REPO_ROOT/.env.local"
  fi
  ok ".env.local ready (DATABASE_URL set)"
}

# ── 2. dependencies ──────────────────────────────────────────────────────
install_deps() {
  log "Installing dependencies …"
  if [[ ! -d "$REPO_ROOT/node_modules" ]]; then
    log "  node_modules missing — fresh clone"
  fi
  # Prefer npm ci for reproducibility; fallback to npm install if lock mismatch
  if [[ -f "$REPO_ROOT/package-lock.json" ]]; then
    if ! npm ci 2>&1 | tail -n 20; then
      warn "npm ci failed — falling back to npm install"
      npm install 2>&1 | tail -n 20
    fi
  else
    npm install 2>&1 | tail -n 20
  fi
  ok "deps installed"
}

# ── 3. database (fresh DB if missing) ───────────────────────────────────
setup_db() {
  log "Database setup (docker compose + db:setup) …"

  # Source env so docker compose + drizzle see DATABASE_URL
  set -a
  # shellcheck disable=SC1091
  . "$REPO_ROOT/.env.local"
  set +a

  # If DATABASE_URL is the local nave_spire_dev, ensure the compose stack is up
  local db_url
  db_url="${DATABASE_URL:-}"
  if [[ "$db_url" == *"nave_spire_dev"* ]]; then
    if have docker; then
      log "  DATABASE_URL is nave_spire_dev → ensuring docker compose postgres"
      # Try without sudo first (quietly), then with sudo; surface the
      # unsudoed error only if BOTH attempts fail. Without this, a harmless
      # "permission denied on docker.sock" leaks into the log even when the
      # sudo fallback succeeds (seen in start_server_log.txt).
      local compose_ok=0
      local unsudoed_err=""
      if unsudoed_err="$(docker compose up -d 2>&1)"; then
        compose_ok=1
        printf '%s\n' "$unsudoed_err" | tail -n 10
      elif have sudo && sudo docker compose up -d 2>&1 | tail -n 10; then
        compose_ok=1
      else
        printf '%s\n' "$unsudoed_err" | tail -n 5 >&2
        warn "docker compose up -d failed — is the daemon running? DATABASE_URL may still be unreachable"
      fi
      if [[ "$compose_ok" -eq 1 ]]; then
        # Wait for healthy (up to 30s)
        log "  waiting for postgres healthy …"
        local i
        for i in $(seq 1 30); do
          if have sudo && sudo docker exec nave_spire_postgres pg_isready -U nave_spire_user -d nave_spire_dev >/dev/null 2>&1; then
            ok "postgres healthy (via sudo docker exec)"
            break
          elif docker exec nave_spire_postgres pg_isready -U nave_spire_user -d nave_spire_dev >/dev/null 2>&1; then
            ok "postgres healthy"
            break
          fi
          sleep 1
          if [[ "$i" -eq 30 ]]; then
            warn "pg_isready still not healthy after 30s — continuing; migrate may fail with helpful error"
          fi
        done
      fi
    else
      warn "docker not found but DATABASE_URL is nave_spire_dev — migrate will fail unless you run docker compose elsewhere"
    fi
  else
    log "  DATABASE_URL is managed/external — skipping docker compose"
  fi

  # One-shot setup: generate (no-op if drizzle/ committed) + migrate + seed (idempotent)
  log "  running npm run db:setup (generate + migrate + seed) …"
  npm run db:setup 2>&1 | tail -n 60

  # Best-effort verification via psql (if available) or via seed log above
  if have sudo && sudo docker exec nave_spire_postgres psql -U nave_spire_user -d nave_spire_dev -c "select tablename from pg_tables where schemaname='public' order by tablename" >/dev/null 2>&1; then
    log "  verifying tables via docker exec psql"
    sudo docker exec nave_spire_postgres psql -U nave_spire_user -d nave_spire_dev -c "select tablename from pg_tables where schemaname='public' order by tablename" 2>&1 | sed 's/^/  /' || true
  elif have docker && docker exec nave_spire_postgres psql -U nave_spire_user -d nave_spire_dev -c "select 1" >/dev/null 2>&1; then
    log "  verifying tables"
    docker exec nave_spire_postgres psql -U nave_spire_user -d nave_spire_dev -c "select tablename from pg_tables where schemaname='public' order by tablename" 2>&1 | sed 's/^/  /' || true
  else
    log "  docker psql not available — relying on db:seed log above for verification"
  fi
  ok "database ready"
}

# ── 4. quality gate ──────────────────────────────────────────────────────
run_quality_gate() {
  log "Running quality gate (typecheck + lint) …"
  npm run typecheck 2>&1 | tail -n 20
  npm run lint 2>&1 | tail -n 30
  # Test suite (Vitest — part of the gate since remediation; a failure
  # aborts via set -euo pipefail, same as typecheck/lint)
  npm test 2>&1 | tail -n 30
  ok "quality gate passed"
}

# ── 5. build ─────────────────────────────────────────────────────────────
build_app() {
  log "Building (next build) …"
  set -a
  # shellcheck disable=SC1091
  . "$REPO_ROOT/.env.local"
  set +a
  npm run build 2>&1 | tail -n 60
  if [[ ! -f "$REPO_ROOT/.next/BUILD_ID" ]]; then
    die "Build failed — .next/BUILD_ID not found"
  fi
  ok "build complete → $REPO_ROOT/.next/BUILD_ID ($(cat "$REPO_ROOT/.next/BUILD_ID"))"
}

# ── 6. start server ──────────────────────────────────────────────────────
start_server() {
  local port="${PORT:-$PORT_DEFAULT}"
  local host="${HOST:-$HOST_DEFAULT}"
  log "Starting server on :$port (host $host) …"

  # Kill any prior server on :$port (idempotent)
  if have fuser; then
    fuser -k "$port/tcp" 2>/dev/null || true
    sleep 1
  elif have lsof; then
    local pids
    pids="$(lsof -ti:"$port" 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then
      log "  killing prior pids $pids on :$port"
      # shellcheck disable=SC2086
      kill $pids 2>/dev/null || true
      sleep 1
    fi
  fi
  pkill -f "next-server" 2>/dev/null || true
  pkill -f "next start" 2>/dev/null || true
  pkill -f "node.*\.next" 2>/dev/null || true
  sleep 1

  rm -f "$PID_FILE"

  # Next.js production server does NOT auto-load .env.local when launched via
  # `npm start` from a different cwd, so we source it into the server env.
  # Use bash `set -a; . file` (not `source` — not portable to dash).
  bash -c "set -a; . \"$REPO_ROOT/.env.local\"; set +a; nohup npm start -- --port $port --hostname $host > \"$LOG_FILE\" 2>&1 & echo \$! > \"$PID_FILE\""
  local pid
  pid="$(cat "$PID_FILE" 2>/dev/null || echo "?")"
  log "  server pid $pid → $LOG_FILE"

  # Wait for ready (up to 45s — cold start + DB seed on first request)
  local i
  for i in $(seq 1 45); do
    if curl -sf "http://localhost:$port/api/health" >/dev/null 2>&1 || curl -sf "http://localhost:$port/" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  if ! curl -sf "http://localhost:$port/api/health" >/dev/null 2>&1 && ! curl -sf "http://localhost:$port/" >/dev/null 2>&1; then
    warn "Server not responding after 45s — tail $LOG_FILE:"
    tail -n 80 "$LOG_FILE" 2>&1 | sed 's/^/  /' || true
    die "Server failed to become ready on :$port"
  fi
  ok "server ready at http://localhost:$port"
}

# ── 7. health check (Nave & Spire smoke) ─────────────────────────────────
health_check() {
  local port="${PORT:-$PORT_DEFAULT}"
  local base="http://localhost:$port"
  log "Health check on $base …"
  local fail=0

  check() {
    local label="$1" url="$2" want="${3:-}"
    local code
    code="$(curl -s -o /tmp/hc_body.html -w "%{http_code}" "$url" 2>&1 || echo 000)"
    if [[ "$code" != "200" && "$code" != "307" && "$code" != "308" ]]; then
      warn "  $label $url → HTTP $code (want 200/307)"
      fail=1
      return
    fi
    if [[ -n "$want" ]]; then
      if ! grep -q "$want" /tmp/hc_body.html 2>&1; then
        warn "  $label $url → HTTP $code but missing '$want'"
        fail=1
        return
      fi
    fi
    log "  ✓ $label $url → $code"
  }

  check "api/health"  "$base/api/health" '"ok":true'
  check "api/audit"   "$base/api/audit" '"ok":true'
  check "home"        "$base/" '"Nave'
  check "compare"     "$base/compare" "Side by side"
  check "findings"    "$base/findings" "Findings"
  check "palettes"    "$base/palettes" "Marian"
  check "reviews"     "$base/reviews" "Score the pair"
  check "method"      "$base/method" "Method"

  # 404
  local nf_code
  nf_code="$(curl -s -o /tmp/hc_body.html -w "%{http_code}" "$base/this-does-not-exist-xyz" 2>&1 || echo 000)"
  if [[ "$nf_code" != "404" ]]; then
    warn "  404 $base/this-does-not-exist-xyz → HTTP $nf_code (want 404)"
    fail=1
  else
    if ! grep -q "Folio not found" /tmp/hc_body.html 2>&1; then
      warn "  404 body missing 'Folio not found'"
      fail=1
    else
      log "  ✓ 404 /this-does-not-exist-xyz → 404"
    fi
  fi

  # Images
  for img in studio-hero.jpg bsc-tent.jpg oll-spire.jpg nave-light.jpg; do
    local code
    code="$(curl -s -o /dev/null -w "%{http_code}" "$base/images/$img" 2>&1 || echo 000)"
    if [[ "$code" != "200" ]]; then
      warn "  image $img → HTTP $code (want 200)"
      fail=1
    else
      log "  ✓ image $img → 200"
    fi
  done

  # Content sanity: audit should have 2 sites
  if ! curl -s "$base/api/audit" 2>&1 | grep -q '"slug":"bsc"'; then
    warn "  api/audit missing bsc site"
    fail=1
  else
    log "  ✓ api/audit has bsc"
  fi

  if [[ "$fail" -ne 0 ]]; then
    die "Health check failed — see warnings above and $LOG_FILE"
  fi
  ok "all health checks passed"
}

# ── main ─────────────────────────────────────────────────────────────────
main() {
  log "=== Nave & Spire — fresh-clone production start ==="
  log "repo: $REPO_ROOT"
  local masked_url
  masked_url="$(grep -E "^DATABASE_URL=" "$REPO_ROOT/.env.local" 2>/dev/null | cut -d= -f2- | tr -d '\r' | sed -E 's|://[^:]+:[^@]+@|://***:***@|' || echo "(will be set via ensure_env)")"
  log "db: $masked_url"
  log "port: ${PORT:-$PORT_DEFAULT} / host: ${HOST:-$HOST_DEFAULT}"
  echo ""

  check_prereqs
  ensure_env
  install_deps
  setup_db
  run_quality_gate
  build_app
  start_server
  health_check

  echo ""
  ok "=== Server live ==="
  echo "  URL:        http://localhost:${PORT:-$PORT_DEFAULT}  (all routes ƒ dynamic, ○ /_not-found static)"
  echo "  PID file:   $PID_FILE  (pid $(cat "$PID_FILE" 2>/dev/null || echo ?))"
  echo "  Log:        $LOG_FILE  (tail -f $LOG_FILE)"
  echo "  Health:     curl http://localhost:${PORT:-$PORT_DEFAULT}/api/health  # {ok:true}"
  echo "  Audit:      curl http://localhost:${PORT:-$PORT_DEFAULT}/api/audit | jq .audit.sites"
  echo "  Reviews:    curl -X POST http://localhost:${PORT:-$PORT_DEFAULT}/api/reviews -H 'Content-Type: application/json' -d '{...}'"
  echo "  Stop:       kill \$(cat $PID_FILE)  # or: fuser -k ${PORT:-$PORT_DEFAULT}/tcp"
  echo ""
  log "Done. DB is nave_spire_dev (or your DATABASE_URL), build is .next/, server is backgrounded."
}

main "$@"
