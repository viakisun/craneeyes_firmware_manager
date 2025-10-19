#!/bin/bash
# sync-localStorage-to-db.sh - localStorage의 펌웨어를 데이터베이스에 동기화

echo "🔄 Syncing localStorage firmware to database..."

# 브라우저에서 localStorage.getItem('craneeyes_firmwares')를 실행하고 결과를 복사해서 여기에 붙여넣기
echo "📋 Please run this in your browser console:"
echo "localStorage.getItem('craneeyes_firmwares')"
echo ""
echo "Then copy the result and paste it below (press Enter when done):"

# 사용자 입력 대기
read -r FIRMWARES_JSON

if [ -z "$FIRMWARES_JSON" ] || [ "$FIRMWARES_JSON" = "null" ]; then
    echo "❌ No firmware data found in localStorage"
    exit 1
fi

echo "📊 Found firmware data, processing..."

# JSON을 파싱하고 SQL INSERT 문 생성
node -e "
const firmwares = JSON.parse('$FIRMWARES_JSON');
console.log('📊 Processing', firmwares.length, 'firmwares...');

// 기존 데이터베이스의 펌웨어와 비교하여 새로운 것만 추가
const sqlInserts = [];
firmwares.forEach(firmware => {
    const sql = \`INSERT INTO firmwares (model_id, version, release_date, size, downloads, s3_key, description) VALUES (\${firmware.modelId}, '\${firmware.version}', '\${firmware.releaseDate}', '\${firmware.size}', \${firmware.downloads}, '\${firmware.s3Key}', '\${firmware.description.replace(/'/g, \"''\")}') ON CONFLICT (model_id, version) DO NOTHING;\`;
    sqlInserts.push(sql);
});

// SQL 파일 생성
const sqlContent = '-- Auto-generated firmware sync SQL\\n' + sqlInserts.join('\\n') + '\\n\\n-- Update firmware counts\\nUPDATE models SET firmware_count = (SELECT COUNT(*) FROM firmwares WHERE firmwares.model_id = models.id);';
require('fs').writeFileSync('database/sync-firmwares.sql', sqlContent);

console.log('✅ Generated SQL file: database/sync-firmwares.sql');
console.log('📊 Total INSERT statements:', sqlInserts.length);
"

# 생성된 SQL 파일 실행
if [ -f "database/sync-firmwares.sql" ]; then
    echo "🚀 Executing SQL file..."
    ./scripts/execute-sql.sh database/sync-firmwares.sql
    echo "✅ Sync completed!"
else
    echo "❌ Failed to generate SQL file"
    exit 1
fi
