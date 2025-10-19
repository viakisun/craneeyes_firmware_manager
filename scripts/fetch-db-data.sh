#!/bin/bash

# Fetch firmware data from database and save to JSON

echo "Fetching firmware data from database..."

PGPASSWORD=dycraneeyes psql -h db-instance-craneeyes.c108ycqiq5cl.ap-northeast-2.rds.amazonaws.com \
  -p 5432 -U postgres -d crane_firmware -t -A -F"," \
  -c "SELECT json_agg(row_to_json(t)) FROM (SELECT id, model_id as \"modelId\", (SELECT name FROM models WHERE id = model_id) as \"modelName\", version, release_date as \"releaseDate\", size, downloads, s3_key as \"s3Key\", description FROM firmwares ORDER BY id) t;" \
  > /tmp/firmwares.json

echo "Firmware data saved to /tmp/firmwares.json"
cat /tmp/firmwares.json

