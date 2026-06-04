#!/usr/bin/env bash
set -e

cp app/Http/Controllers/Api/DispatchController.php \
app/Http/Controllers/Api/DispatchController.php.bak_step10_active_orders_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("app/Http/Controllers/Api/DispatchController.php")
s = p.read_text()

s = s.replace("->with(['driver', 'user'])", "->with(['driver.user', 'rider'])", 1)

# Safe fare fallback
s = s.replace("'fare' => '$' . number_format($ride->total_fare, 2),", "'fare' => '$' . number_format((float)($ride->total_fare ?? $ride->fare ?? 0), 2),")

p.write_text(s)
PY

php -l app/Http/Controllers/Api/DispatchController.php
php artisan optimize:clear

grep -n "Active Rides" -A25 app/Http/Controllers/Api/DispatchController.php

echo "STEP10 OK"
