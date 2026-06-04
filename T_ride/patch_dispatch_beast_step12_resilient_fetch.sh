#!/usr/bin/env bash
set -e

cp resources/js/pages/admin/dispatch.tsx \
resources/js/pages/admin/dispatch.tsx.bak_step12_resilient_fetch_$(date +%Y%m%d_%H%M%S)

python3 <<'PY'
from pathlib import Path

p = Path("resources/js/pages/admin/dispatch.tsx")
s = p.read_text()

old = """            const [statsRes, ordersRes, activeRes, driversRes] = await Promise.all([
                axios.get('/admin/dispatch/stats'),
                axios.get('/admin/dispatch/pending-orders'),
                axios.get('/admin/dispatch/active-orders'),
                axios.get('/admin/dispatch/available-drivers')
            ])

            if (statsRes.data.status) setStats(statsRes.data.data)
            if (ordersRes.data.status) setPendingOrders(ordersRes.data.data)
            if (activeRes.data.status) setActiveOrders(activeRes.data.data)
            if (driversRes.data.status) setAvailableDrivers(driversRes.data.data)
"""

new = """            const results = await Promise.allSettled([
                axios.get('/admin/dispatch/stats'),
                axios.get('/admin/dispatch/pending-orders'),
                axios.get('/admin/dispatch/active-orders'),
                axios.get('/admin/dispatch/available-drivers')
            ])

            const [statsRes, ordersRes, activeRes, driversRes] = results

            if (statsRes.status === 'fulfilled' && statsRes.value.data.status) {
                setStats(statsRes.value.data.data)
            }

            if (ordersRes.status === 'fulfilled' && ordersRes.value.data.status) {
                setPendingOrders(ordersRes.value.data.data)
            }

            if (activeRes.status === 'fulfilled' && activeRes.value.data.status) {
                setActiveOrders(activeRes.value.data.data)
            } else {
                console.warn('Active orders endpoint failed', activeRes)
                setActiveOrders([])
            }

            if (driversRes.status === 'fulfilled' && driversRes.value.data.status) {
                setAvailableDrivers(driversRes.value.data.data)
            }
"""

if old not in s:
    raise SystemExit("Promise.all dispatch block not found")

p.write_text(s.replace(old, new, 1))
PY

grep -n "Promise.allSettled\|Active orders endpoint failed" resources/js/pages/admin/dispatch.tsx

echo "STEP12 SOURCE OK"
