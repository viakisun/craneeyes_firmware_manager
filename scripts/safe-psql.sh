#!/bin/bash
# safe-psql.sh - 안전한 psql 실행 스크립트

# 설정
DB_HOST="db-instance-craneeyes.c108ycqiq5cl.ap-northeast-2.rds.amazonaws.com"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="crane_firmware"
DB_PASSWORD="dycraneeyes"

# 타임아웃 설정 (초)
TIMEOUT=30

echo "🔗 Connecting to CraneEyes Database..."
echo "⏱️  Timeout: ${TIMEOUT} seconds"

# 백그라운드에서 psql 실행
{
    echo "SELECT 'Connection established at ' || now() as status;"
    echo "$1"
} | PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --set=statement_timeout=${TIMEOUT}000 &

# 프로세스 ID 저장
PSQL_PID=$!

# 타임아웃 대기
sleep $TIMEOUT

# 프로세스가 아직 실행 중이면 종료
if kill -0 $PSQL_PID 2>/dev/null; then
    echo "⏰ Query timed out after ${TIMEOUT} seconds"
    kill $PSQL_PID 2>/dev/null
    exit 1
else
    echo "✅ Query completed successfully"
    wait $PSQL_PID
    exit $?
fi
