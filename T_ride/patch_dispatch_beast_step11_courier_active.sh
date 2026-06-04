#!/usr/bin/env bash
set -e

cp app/Http/Controllers/Api/DispatchController.php \
app/Http/Controllers/Api/DispatchController.php.bak_step11_courier_active_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("app/Http/Controllers/Api/DispatchController.php")
s = p.read_text()

s = s.replace(
"""        $couriers = Order::whereIn('status', ['In Transit'])
            ->with(['driver', 'user'])
            ->latest()
""",
"""        $couriers = Order::whereIn('status', ['In Transit'])
            ->latest()
"""
)

s = s.replace(
"'driver' => $order->driver?->name ?? 'Unassigned',",
"'driver' => $order->courier ?? 'Unassigned',"
)

s = s.replace(
"'fare' => '$' . number_format($order->price, 2),",
"'fare' => '$' . number_format((float)($order->price ?? 0), 2),"
)

p.write_text(s)
PY

php -l app/Http/Controllers/Api/DispatchController.php
php artisan optimize:clear

grep -n "Active Courier Orders" -A22 app/Http/Controllers/Api/DispatchController.php

echo "STEP11 OK"
