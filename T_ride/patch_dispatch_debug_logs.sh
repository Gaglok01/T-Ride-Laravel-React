#!/usr/bin/env bash
set -e

cp app/Http/Controllers/Api/DispatchController.php \
app/Http/Controllers/Api/DispatchController.php.bak_debug_logs_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("app/Http/Controllers/Api/DispatchController.php")
s = p.read_text()

s = s.replace("    public function getStats()\n    {", "    public function getStats()\n    {\n        \\Log::info('DISPATCH getStats HIT');")
s = s.replace("    public function getPendingOrders()\n    {", "    public function getPendingOrders()\n    {\n        \\Log::info('DISPATCH getPendingOrders HIT');")
s = s.replace("    public function getAvailableDrivers()\n    {", "    public function getAvailableDrivers()\n    {\n        \\Log::info('DISPATCH getAvailableDrivers HIT');")
s = s.replace("    public function getActiveOrders()\n    {", "    public function getActiveOrders()\n    {\n        \\Log::info('DISPATCH getActiveOrders HIT');")

p.write_text(s)
PY

php -l app/Http/Controllers/Api/DispatchController.php
php artisan optimize:clear
echo "DEBUG LOG PATCH OK"
