#!/usr/bin/env bash
set -e

cp app/Http/Controllers/Api/AppDriverController.php \
   app/Http/Controllers/Api/AppDriverController.php.bak_dispatch_beast_step2_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("app/Http/Controllers/Api/AppDriverController.php")
s = p.read_text()

old = """        $requests = Ride::where('status', 'searching')
"""

new = """        $requests = Ride::where(function ($q) use ($driver) {
                $q->where('status', 'searching')
                  ->orWhere(function ($x) use ($driver) {
                      $x->where('status', 'assigned')
                        ->where('driver_id', $driver->id);
                  });
            })
"""

if old not in s:
    raise SystemExit("Target block not found")

p.write_text(s.replace(old, new, 1))
PY

php -l app/Http/Controllers/Api/AppDriverController.php

grep -n "assigned" app/Http/Controllers/Api/AppDriverController.php | head -20

echo "STEP2 OK"
