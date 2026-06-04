#!/usr/bin/env bash
set -e

cp app/Http/Controllers/Api/DispatchController.php \
app/Http/Controllers/Api/DispatchController.php.bak_step7_admin_pending_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("app/Http/Controllers/Api/DispatchController.php")
s = p.read_text()

s = s.replace(
    "Ride::where('status', 'pending')->whereNull('driver_id')->count()",
    "Ride::where('status', 'searching')->whereNull('driver_id')->count()"
)

s = s.replace(
    "$rides = Ride::where('status', 'pending')",
    "$rides = Ride::where('status', 'searching')"
)

p.write_text(s)
PY

php -l app/Http/Controllers/Api/DispatchController.php
php artisan optimize:clear

grep -n "Ride::where('status'" app/Http/Controllers/Api/DispatchController.php

echo "STEP7 OK"
