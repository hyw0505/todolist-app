#!/bin/bash
# =============================================================
# todolist-app 데이터베이스 복구 스크립트
# 사용법: ./restore.sh <백업파일경로>
# 예시:   ./restore.sh database/backups/todolist_dev_20260401_020000.sql.gz
# =============================================================

set -euo pipefail

BACKUP_FILE="${1:-}"
if [ -z "${BACKUP_FILE}" ]; then
  echo "사용법: $0 <백업파일경로>"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "오류: 백업 파일을 찾을 수 없습니다 → ${BACKUP_FILE}"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "${SCRIPT_DIR}/../.env" ]; then
  export $(grep -v '^#' "${SCRIPT_DIR}/../.env" | xargs)
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-todolist_dev}"
DB_USER="${DB_USER:-todolist-user}"
PGPASSWORD="${DB_PASSWORD:-todolist}"
export PGPASSWORD

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 복구 시작: ${BACKUP_FILE} → ${DB_NAME}"

gunzip -c "${BACKUP_FILE}" | psql \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-password

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 복구 완료: ${DB_NAME}"
