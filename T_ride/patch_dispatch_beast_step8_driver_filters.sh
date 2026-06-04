#!/usr/bin/env bash
set -e

cp app/Http/Controllers/Api/DispatchController.php \
app/Http/Controllers/Api/DispatchController.php.bak_step8_driver_filters_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("app/Http/Controllers/Api/DispatchController.php")
s = p.read_text()

s = s.replace(
    "$onlineDrivers = Driver::where('status', 'active')->count();",
    "$onlineDrivers = Driver::whereIn('status', ['active', 'Active'])->where('is_online', 1)->count();"
)

s = s.replace(
    "$drivers = Driver::where('status', 'active')\n            ->with('type')",
    "$drivers = Driver::whereIn('status', ['active', 'Active'])\n            ->where('is_online', 1)\n            ->where('account_status', 'approved')\n            ->with(['type', 'user'])"
)

s = s.replace(
    "'name' => $driver->name,",
    "'name' => $driver->name ?: optional($driver->user)->name,"
)

s = s.replace(
    "'phone' => $driver->phone,",
    "'phone' => $driver->phone ?: optional($driver->user)->phone,"
)

p.write_text(s)
PY

php -l app/Http/Controllers/Api/DispatchController.php
php artisan optimize:clear

grep -n "onlineDrivers\|whereIn('status'.*Active\|where('is_online'\|account_status\|optional" app/Http/Controllers/Api/DispatchController.php | head -40

echo "STEP8 OK"
