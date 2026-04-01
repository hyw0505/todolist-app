#!/bin/bash
# =============================================================
# todolist-app 데이터베이스 자동 백업 스크립트
# - 일일 1회 실행 권장 (cron: 0 2 * * *)
# - 백업 보관 기간: 7일
# =============================================================

set -euo pipefail

# 환경변수 (.env 로드)
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

BACKUP_DIR="${SCRIPT_DIR}/backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 백업 시작: ${DB_NAME}"

# pg_dump 실행 및 gzip 압축
pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-password \
  --format=plain \
  --clean \
  --if-exists \
  | gzip > "${BACKUP_FILE}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 백업 완료: ${BACKUP_FILE}"

# 7일 이상된 백업 파일 삭제
find "${BACKUP_DIR}" -name "${DB_NAME}_*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} \;
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${RETENTION_DAYS}일 초과 백업 파일 정리 완료"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 현재 보관 중인 백업 파일:"
ls -lh "${BACKUP_DIR}/${DB_NAME}_"*.sql.gz 2>/dev/null || echo "  (없음)"
