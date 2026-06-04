#!/usr/bin/env bash
set -e

cp app/Http/Controllers/Api/AppRideController.php \
app/Http/Controllers/Api/AppRideController.php.bak_dispatch_beast_step4_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("app/Http/Controllers/Api/AppRideController.php")
s = p.read_text()

old = "->whereIn('status', ['searching', 'accepted', 'arrived', 'in_progress'])"
new = "->whereIn('status', ['searching', 'assigned', 'accepted', 'arrived', 'in_progress'])"

if old not in s:
    raise SystemExit("Active ride status block not found")

p.write_text(s.replace(old, new, 1))
PY

php -l app/Http/Controllers/Api/AppRideController.php

grep -n "searching', 'assigned', 'accepted" app/Http/Controllers/Api/AppRideController.php

echo "STEP4 OK"
