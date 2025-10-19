#!/bin/bash
# add-firmware-to-db.sh - 직접 펌웨어를 데이터베이스에 추가

echo "📝 Adding firmware to database..."

# 설정
DB_HOST="db-instance-craneeyes.c108ycqiq5cl.ap-northeast-2.rds.amazonaws.com"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="crane_firmware"
DB_PASSWORD="dycraneeyes"

# 사용자 입력 받기
echo "Enter firmware details:"
read -p "Model ID (2 for SS1406): " MODEL_ID
read -p "Version (e.g., 3.1.1): " VERSION
read -p "S3 Key (e.g., firmwares/SS1406/3.1.1/filename.pdf): " S3_KEY
read -p "Description: " DESCRIPTION

# 기본값 설정
MODEL_ID=${MODEL_ID:-2}
VERSION=${VERSION:-"3.1.1"}
S3_KEY=${S3_KEY:-"firmwares/SS1406/3.1.1/sample.pdf"}
DESCRIPTION=${DESCRIPTION:-"New firmware upload"}

# 파일 크기 계산 (S3에서 가져오기)
FILE_SIZE="2.5 MB"  # 기본값

# SQL 실행
SQL="INSERT INTO firmwares (model_id, version, release_date, size, downloads, s3_key, description) VALUES ($MODEL_ID, '$VERSION', '$(date +%Y-%m-%d)', '$FILE_SIZE', 0, '$S3_KEY', '$DESCRIPTION') ON CONFLICT (model_id, version) DO UPDATE SET s3_key = '$S3_KEY', description = '$DESCRIPTION', release_date = '$(date +%Y-%m-%d)';"

echo "🚀 Executing SQL..."
echo "SQL: $SQL"

gtimeout 30 bash -c "PGPASSWORD='$DB_PASSWORD' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c '$SQL'"

if [ $? -eq 0 ]; then
    echo "✅ Firmware added successfully!"
    
    # 펌웨어 카운트 업데이트
    echo "🔄 Updating firmware counts..."
    UPDATE_SQL="UPDATE models SET firmware_count = (SELECT COUNT(*) FROM firmwares WHERE firmwares.model_id = models.id);"
    gtimeout 30 bash -c "PGPASSWORD='$DB_PASSWORD' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c '$UPDATE_SQL'"
    
    echo "✅ All done! Check the database:"
    gtimeout 10 bash -c "PGPASSWORD='$DB_PASSWORD' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c \"SELECT f.id, m.name, f.version, f.s3_key FROM firmwares f JOIN models m ON f.model_id = m.id WHERE m.name = 'SS1406' ORDER BY f.id DESC LIMIT 3;\""
else
    echo "❌ Failed to add firmware"
fi
