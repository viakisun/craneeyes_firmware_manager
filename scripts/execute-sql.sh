#!/bin/bash
# execute-sql.sh - 안전하게 SQL을 실행하는 스크립트

# 설정
DB_HOST="db-instance-craneeyes.c108ycqiq5cl.ap-northeast-2.rds.amazonaws.com"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="crane_firmware"
DB_PASSWORD="dycraneeyes"

# SQL 파일 또는 쿼리
SQL_FILE="$1"
SQL_QUERY="$2"

echo "🔗 Connecting to CraneEyes Database..."

if [ -n "$SQL_FILE" ] && [ -f "$SQL_FILE" ]; then
    echo "📄 Executing SQL file: $SQL_FILE"
    gtimeout 30 bash -c "PGPASSWORD='$DB_PASSWORD' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -f '$SQL_FILE'"
elif [ -n "$SQL_QUERY" ]; then
    echo "📝 Executing SQL query: $SQL_QUERY"
    gtimeout 30 bash -c "PGPASSWORD='$DB_PASSWORD' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c '$SQL_QUERY'"
else
    echo "❌ Usage: $0 <sql_file> OR $0 '' '<sql_query>'"
    echo "📝 Example: $0 '' \"SELECT COUNT(*) FROM firmwares;\""
    exit 1
fi

echo "✅ SQL execution completed"
