#!/usr/bin/env bash
set -e

cp app/Services/FirestoreRideSyncService.php \
app/Services/FirestoreRideSyncService.php.bak_dispatch_beast_step5_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("app/Services/FirestoreRideSyncService.php")
s = p.read_text()

old = """            'driver_name' => optional(optional($ride->driver)->user)->name,
            'driver_phone' => optional(optional($ride->driver)->user)->phone,
"""

new = """            'driver_name' => in_array($firestoreStatus, ['accepted', 'arrived', 'started', 'completed'], true)
                ? optional(optional($ride->driver)->user)->name
                : null,
            'driver_phone' => in_array($firestoreStatus, ['accepted', 'arrived', 'started', 'completed'], true)
                ? optional(optional($ride->driver)->user)->phone
                : null,
"""

if old not in s:
    raise SystemExit("Driver info block not found")

p.write_text(s.replace(old, new, 1))
PY

php -l app/Services/FirestoreRideSyncService.php

grep -n "driver_name\|driver_phone\|accepted', 'arrived', 'started" app/Services/FirestoreRideSyncService.php

echo "STEP5 OK"
