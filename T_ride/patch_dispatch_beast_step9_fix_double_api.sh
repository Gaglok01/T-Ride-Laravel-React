#!/usr/bin/env bash
set -e

cp resources/js/pages/admin/dispatch.tsx \
resources/js/pages/admin/dispatch.tsx.bak_step9_double_api_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("resources/js/pages/admin/dispatch.tsx")
s = p.read_text()

s = s.replace('R.get("/api/public/driver/heat-map")', 'R.get("/public/driver/heat-map")')
s = s.replace("R.get('/api/public/driver/heat-map')", "R.get('/public/driver/heat-map')")

p.write_text(s)
PY

grep -n "heat-map" resources/js/pages/admin/dispatch.tsx

echo "STEP9 SOURCE OK"
