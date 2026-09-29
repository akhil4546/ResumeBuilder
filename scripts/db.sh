#!/usr/bin/env bash
# Manage the local userspace PostgreSQL instance for the resume builder.
# Usage: scripts/db.sh {start|stop|status|psql|reset}
set -euo pipefail

PG_HOME="$HOME/.local/pgsql"
PG_BIN="$PG_HOME/dist/bin"
DATA="$PG_HOME/data"
LOG="$PG_HOME/server.log"
PORT=5433

export PATH="$PG_BIN:$PATH"

case "${1:-status}" in
  start)
    if pg_ctl -D "$DATA" status >/dev/null 2>&1; then
      echo "Postgres already running on port $PORT."
    else
      pg_ctl -D "$DATA" -l "$LOG" -o "-p $PORT" -w start
    fi
    ;;
  stop)
    pg_ctl -D "$DATA" -w stop || true
    ;;
  status)
    pg_ctl -D "$DATA" status || true
    ;;
  psql)
    psql -p "$PORT" -U resume -h 127.0.0.1 -d resume_builder
    ;;
  reset)
    psql -p "$PORT" -U postgres -h 127.0.0.1 -d postgres -c "DROP DATABASE IF EXISTS resume_builder;"
    psql -p "$PORT" -U postgres -h 127.0.0.1 -d postgres -c "CREATE DATABASE resume_builder OWNER resume;"
    echo "Database reset. Run: npx prisma migrate deploy"
    ;;
  *)
    echo "Usage: scripts/db.sh {start|stop|status|psql|reset}"
    exit 1
    ;;
esac
