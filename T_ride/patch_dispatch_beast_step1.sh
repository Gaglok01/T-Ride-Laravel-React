#!/usr/bin/env bash
set -e

echo "== Backup files =="
cp app/Http/Controllers/Api/DispatchController.php app/Http/Controllers/Api/DispatchController.php.bak_dispatch_beast_step1_$(date +%Y%m%d_%H%M%S)
cp app/Http/Controllers/Api/AppDriverController.php app/Http/Controllers/Api/AppDriverController.php.bak_dispatch_beast_step1_$(date +%Y%m%d_%H%M%S)

echo "== Patch DispatchController ride assignment =="
python3 <<'PY'
from pathlib import Path

p = Path("app/Http/Controllers/Api/DispatchController.php")
s = p.read_text()

old = """                case 'ride':
                    $order = Ride::find($request->order_id);
                    if ($order) {
                        $order->driver_id = $request->driver_id;
                        $order->status = 'accepted';
                        $order->save();
                    }
                    break;
"""

new = """                case 'ride':
                    $order = Ride::find($request->order_id);
                    if ($order) {
                        $order->driver_id = $request->driver_id;
                        $order->status = 'assigned';
                        $order->save();

                        try {
                            app(\\App\\Services\\FirestoreRideSyncService::class)->sync($order, 'assigned');
                        } catch (\\Throwable $e) {
                            \\Log::error('Firestore assigned sync failed', [
                                'ride_id' => $order->id,
                                'driver_id' => $request->driver_id,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }
                    break;
"""

if old not in s:
    raise SystemExit("Ride assignment block not found. No change made.")

p.write_text(s.replace(old, new))
PY

echo "== Patch AppDriverController respondToRide =="
python3 <<'PY'
from pathlib import Path

p = Path("app/Http/Controllers/Api/AppDriverController.php")
s = p.read_text()

old = """        if (!$ride || $ride->status !== 'searching') {
            return response()->json(['status' => false, 'message' => 'Ride is no longer available'], 404);
        }

        $driver = Driver::where('user_id', Auth::id())->first();
        if (!$driver) {
            return response()->json(['status' => false, 'message' => 'Driver not found'], 404);
        }
"""

new = """        if (!$ride || !in_array($ride->status, ['searching', 'assigned'], true)) {
            return response()->json(['status' => false, 'message' => 'Ride is no longer available'], 404);
        }

        $driver = Driver::where('user_id', Auth::id())->first();
        if (!$driver) {
            return response()->json(['status' => false, 'message' => 'Driver not found'], 404);
        }

        if ($ride->status === 'assigned' && (int) $ride->driver_id !== (int) $driver->id) {
            return response()->json([
                'status' => false,
                'message' => 'This ride is assigned to another driver'
            ], 403);
        }
"""

if old not in s:
    raise SystemExit("respondToRide block not found. No change made.")

p.write_text(s.replace(old, new))
PY

echo "== Clear cache and syntax check =="
php artisan optimize:clear
php -l app/Http/Controllers/Api/DispatchController.php
php -l app/Http/Controllers/Api/AppDriverController.php

echo "== Verify patch =="
grep -n "status = 'assigned'\|Firestore assigned sync\|This ride is assigned to another driver\|searching', 'assigned" app/Http/Controllers/Api/DispatchController.php app/Http/Controllers/Api/AppDriverController.php

echo "PATCH OK"
