#!/usr/bin/env bash
set -e

cp app/Http/Controllers/Api/DispatchController.php \
app/Http/Controllers/Api/DispatchController.php.bak_dispatch_beast_step6_log_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("app/Http/Controllers/Api/DispatchController.php")
s = p.read_text()

old = """                            if ($token) {
                                app(\\App\\Services\\FcmNotificationService::class)
"""

new = """                            if ($token) {
                                \\Log::info('Dispatch assigned notification sending', [
                                    'ride_id' => $order->id,
                                    'driver_id' => $driver->id,
                                    'type' => 'ride_assigned',
                                ]);

                                app(\\App\\Services\\FcmNotificationService::class)
"""

if old not in s:
    raise SystemExit("Target notification block not found")

p.write_text(s.replace(old, new, 1))
PY

php -l app/Http/Controllers/Api/DispatchController.php
echo "STEP6 LOG OK"
