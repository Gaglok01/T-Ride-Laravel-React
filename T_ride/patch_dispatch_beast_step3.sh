#!/usr/bin/env bash
set -e

cp app/Http/Controllers/Api/DispatchController.php \
app/Http/Controllers/Api/DispatchController.php.bak_dispatch_beast_step3_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("app/Http/Controllers/Api/DispatchController.php")
s = p.read_text()

old = """
                        try {
                            app(\\App\\Services\\FirestoreRideSyncService::class)->sync($order, 'assigned');
                        } catch (\\Throwable $e) {
                            \\Log::error('Firestore assigned sync failed', [
                                'ride_id' => $order->id,
                                'driver_id' => $request->driver_id,
                                'error' => $e->getMessage()
                            ]);
                        }
"""

new = """
                        try {
                            app(\\App\\Services\\FirestoreRideSyncService::class)->sync($order, 'assigned');
                        } catch (\\Throwable $e) {
                            \\Log::error('Firestore assigned sync failed', [
                                'ride_id' => $order->id,
                                'driver_id' => $request->driver_id,
                                'error' => $e->getMessage()
                            ]);
                        }

                        try {
                            $token = optional($driver->user)->fcm_token;

                            if ($token) {
                                app(\\App\\Services\\FcmNotificationService::class)
                                    ->sendToToken(
                                        $token,
                                        'New ride assigned',
                                        'A dispatcher assigned a ride to you.',
                                        [
                                            'type' => 'ride_assigned',
                                            'ride_id' => (string)$order->id,
                                            'status' => 'assigned',
                                        ]
                                    );
                            }
                        } catch (\\Throwable $e) {
                            \\Log::error('Assigned ride FCM failed', [
                                'ride_id' => $order->id,
                                'driver_id' => $request->driver_id,
                                'error' => $e->getMessage()
                            ]);
                        }
"""

if old not in s:
    raise SystemExit("Target block not found")

p.write_text(s.replace(old, new, 1))
PY

php -l app/Http/Controllers/Api/DispatchController.php

grep -n "ride_assigned\|Assigned ride FCM failed\|New ride assigned" \
app/Http/Controllers/Api/DispatchController.php

echo "STEP3 OK"
