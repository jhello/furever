#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$ROOT_DIR/server/data/server.pid"
LOG_FILE="$ROOT_DIR/server/data/server.log"

mkdir -p "$(dirname "$PID_FILE")"

running_pid() {
  if [ -f "$PID_FILE" ]; then
    local pid
    pid="$(cat "$PID_FILE")"
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "$pid"
    fi
  fi
}

wait_until_up() {
  for _ in $(seq 1 30); do
    if curl -fsS http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.1
  done
  return 1
}

case "${1:-status}" in
  start)
    pid="$(running_pid)"
    if [ -n "$pid" ]; then
      echo "FurEver server already running (PID $pid)"
      exit 0
    fi
    cd "$ROOT_DIR/server"
    nohup node src/index.js >"$LOG_FILE" 2>&1 </dev/null &
    echo $! >"$PID_FILE"
    if wait_until_up; then
      echo "FurEver server started (PID $(cat "$PID_FILE")), log: $LOG_FILE"
    else
      echo "FurEver server failed to start; see $LOG_FILE" >&2
      rm -f "$PID_FILE"
      exit 1
    fi
    ;;
  stop)
    pid="$(running_pid)"
    if [ -z "$pid" ]; then
      echo "FurEver server is not running"
      rm -f "$PID_FILE"
      exit 0
    fi
    kill "$pid"
    for _ in $(seq 1 20); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.1
    done
    if kill -0 "$pid" 2>/dev/null; then
      echo "FurEver server did not stop (PID $pid)" >&2
      exit 1
    fi
    rm -f "$PID_FILE"
    echo "FurEver server stopped (PID $pid)"
    ;;
  restart)
    "$0" stop
    "$0" start
    ;;
  status)
    pid="$(running_pid)"
    if [ -n "$pid" ]; then
      echo "FurEver server is running (PID $pid)"
    else
      echo "FurEver server is not running"
    fi
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}" >&2
    exit 2
    ;;
esac
