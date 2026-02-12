<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentTransaction;
use App\Models\CommissionEarning;
use App\Models\Order;
use App\Models\Ride;
use App\Models\DeliveryOrder;
use App\Models\Rental;
use App\Models\Driver;
use App\Models\Vendor;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceController extends Controller
{
    /**
     * Helper: Apply date range filtering to a query.
     */
    private function applyDateFilter($query, Request $request, $dateColumn = 'created_at')
    {
        $range = $request->query('range');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        if ($startDate && $endDate) {
            $query->whereBetween($dateColumn, [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]);
        } elseif ($range === 'today') {
            $query->whereDate($dateColumn, Carbon::today());
        } elseif ($range === 'yesterday') {
            $query->whereDate($dateColumn, Carbon::yesterday());
        } elseif ($range === 'this_week') {
            $query->whereBetween($dateColumn, [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($range === 'this_month') {
            $query->whereMonth($dateColumn, Carbon::now()->month)
                  ->whereYear($dateColumn, Carbon::now()->year);
        } elseif ($range === 'last_month') {
            $query->whereMonth($dateColumn, Carbon::now()->subMonth()->month)
                  ->whereYear($dateColumn, Carbon::now()->subMonth()->year);
        } elseif ($range === 'this_year') {
            $query->whereYear($dateColumn, Carbon::now()->year);
        } else {
            // Default: this month
            $query->whereMonth($dateColumn, Carbon::now()->month)
                  ->whereYear($dateColumn, Carbon::now()->year);
        }

        return $query;
    }

    /**
     * Helper: Calculate percentage change between current and previous period.
     */
    private function calculateTrend($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? '+100%' : '0%';
        }
        $change = (($current - $previous) / $previous) * 100;
        $prefix = $change >= 0 ? '+' : '';
        return $prefix . round($change, 1) . '%';
    }

    /**
     * GET /api/admin/finance/stats
     * Top-level finance stats: revenue, profit, margin, payouts, processed today, failed.
     */
    public function getStats(Request $request)
    {
        // Current period
        $completedQuery = PaymentTransaction::query()->where('status', 'completed');
        $this->applyDateFilter($completedQuery, $request, 'processed_at');
        $totalRevenue = (float) $completedQuery->sum('amount');

        // Previous period for trends
        $prevCompletedQuery = PaymentTransaction::query()->where('status', 'completed');
        $this->applyPreviousPeriodFilter($prevCompletedQuery, $request, 'processed_at');
        $prevRevenue = (float) $prevCompletedQuery->sum('amount');

        // Commission earnings as net profit
        $commissionTotal = (float) CommissionEarning::sum('commission_earned');
        $netProfit = $commissionTotal > 0 ? $commissionTotal : $totalRevenue * 0.20;

        $grossMargin = $totalRevenue > 0 ? ($netProfit / $totalRevenue) * 100 : 0;

        $pendingPayouts = (float) PaymentTransaction::where('status', 'pending')
            ->whereIn('type', ['payout', 'withdrawal'])
            ->sum('amount');

        $processedToday = (float) PaymentTransaction::where('status', 'completed')
            ->whereDate('processed_at', Carbon::today())
            ->sum('amount');

        $failedTransactions = PaymentTransaction::where('status', 'failed')->count();

        // Previous period values for trends
        $prevProfit = $prevRevenue * 0.20;
        $prevMargin = $prevRevenue > 0 ? ($prevProfit / $prevRevenue) * 100 : 0;

        $prevPending = (float) PaymentTransaction::where('status', 'pending')
            ->whereIn('type', ['payout', 'withdrawal'])
            ->sum('amount');

        $prevProcessedToday = (float) PaymentTransaction::where('status', 'completed')
            ->whereDate('processed_at', Carbon::yesterday())
            ->sum('amount');

        $prevFailed = PaymentTransaction::where('status', 'failed')
            ->whereDate('created_at', '<', Carbon::today()->subDays(30))
            ->count();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'net_profit' => round($netProfit, 2),
            'gross_margin' => round($grossMargin, 2),
            'pending_payouts' => $pendingPayouts,
            'processed_today' => $processedToday,
            'failed_transactions' => $failedTransactions,
            'trends' => [
                'revenue' => $this->calculateTrend($totalRevenue, $prevRevenue),
                'profit' => $this->calculateTrend($netProfit, $prevProfit),
                'margin' => $this->calculateTrend($grossMargin, $prevMargin),
                'payouts' => $this->calculateTrend($pendingPayouts, $prevPending),
                'processed' => $this->calculateTrend($processedToday, $prevProcessedToday),
                'failed' => ($failedTransactions - $prevFailed) >= 0
                    ? '+' . ($failedTransactions - $prevFailed)
                    : (string)($failedTransactions - $prevFailed),
            ],
        ]);
    }

    /**
     * GET /api/admin/finance/service-revenue
     * Revenue breakdown by service: Ride, Courier, Delivery, Rental.
     */
    public function getServiceRevenue(Request $request)
    {
        // Ride Revenue
        $rideQuery = Ride::query()->where('payment_status', 'paid');
        $this->applyDateFilter($rideQuery, $request, 'completed_at');
        $rideRevenue = (float) $rideQuery->sum('fare');
        $rideTrips = (int) $rideQuery->count();

        // Courier Revenue (Orders table = courier orders)
        $courierQuery = Order::query()->where('status', 'delivered');
        $this->applyDateFilter($courierQuery, $request);
        $courierRevenue = (float) $courierQuery->sum('fee');
        $courierDeliveries = (int) $courierQuery->count();

        // Delivery Revenue
        $deliveryQuery = DeliveryOrder::query()->where('status', 'delivered');
        $this->applyDateFilter($deliveryQuery, $request);
        $deliveryRevenue = (float) $deliveryQuery->sum('total_amount');
        $deliveryOrders = (int) $deliveryQuery->count();

        // Rental Revenue
        $rentalRevenue = (float) Rental::where('status', 'active')->sum('weekly_rate');
        $rentalActive = (int) Rental::where('status', 'active')->count();

        // Previous period for trends
        $prevRideQuery = Ride::query()->where('payment_status', 'paid');
        $this->applyPreviousPeriodFilter($prevRideQuery, $request, 'completed_at');
        $prevRideRevenue = (float) $prevRideQuery->sum('fare');

        $prevCourierQuery = Order::query()->where('status', 'delivered');
        $this->applyPreviousPeriodFilter($prevCourierQuery, $request);
        $prevCourierRevenue = (float) $prevCourierQuery->sum('fee');

        $prevDeliveryQuery = DeliveryOrder::query()->where('status', 'delivered');
        $this->applyPreviousPeriodFilter($prevDeliveryQuery, $request);
        $prevDeliveryRevenue = (float) $prevDeliveryQuery->sum('total_amount');

        return response()->json([
            'ride_revenue' => $rideRevenue,
            'courier_revenue' => $courierRevenue,
            'delivery_revenue' => $deliveryRevenue,
            'rental_revenue' => $rentalRevenue,
            'ride_trips' => $rideTrips,
            'courier_deliveries' => $courierDeliveries,
            'delivery_orders' => $deliveryOrders,
            'rental_active' => $rentalActive,
            'trends' => [
                'ride_revenue' => $this->calculateTrend($rideRevenue, $prevRideRevenue),
                'courier_revenue' => $this->calculateTrend($courierRevenue, $prevCourierRevenue),
                'delivery_revenue' => $this->calculateTrend($deliveryRevenue, $prevDeliveryRevenue),
                'rental_revenue' => '+0%',
            ],
        ]);
    }

    /**
     * GET /api/admin/finance/revenue-trend
     * Monthly revenue data for the last 12 months.
     */
    public function getRevenueTrend(Request $request)
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = [
                'year' => $date->year,
                'month_num' => $date->month,
                'month' => $date->format('M'),
            ];
        }

        $trend = [];
        foreach ($months as $m) {
            $total = (float) PaymentTransaction::where('status', 'completed')
                ->whereMonth('processed_at', $m['month_num'])
                ->whereYear('processed_at', $m['year'])
                ->sum('amount');

            // If no payment transactions, fallback to rides + delivery + courier
            if ($total == 0) {
                $rideTotal = (float) Ride::where('payment_status', 'paid')
                    ->whereMonth('completed_at', $m['month_num'])
                    ->whereYear('completed_at', $m['year'])
                    ->sum('fare');

                $deliveryTotal = (float) DeliveryOrder::where('status', 'delivered')
                    ->whereMonth('created_at', $m['month_num'])
                    ->whereYear('created_at', $m['year'])
                    ->sum('total_amount');

                $courierTotal = (float) Order::where('status', 'delivered')
                    ->whereMonth('created_at', $m['month_num'])
                    ->whereYear('created_at', $m['year'])
                    ->sum('fee');

                $total = $rideTotal + $deliveryTotal + $courierTotal;
            }

            $trend[] = [
                'month' => $m['month'],
                'total' => $total,
            ];
        }

        return response()->json($trend);
    }

    /**
     * GET /api/admin/finance/revenue-distribution
     * Revenue distribution by service type for pie chart.
     */
    public function getRevenueDistribution(Request $request)
    {
        $rideRevenue = (float) Ride::where('payment_status', 'paid')->sum('fare');
        $courierRevenue = (float) Order::where('status', 'delivered')->sum('fee');
        $deliveryRevenue = (float) DeliveryOrder::where('status', 'delivered')->sum('total_amount');
        $rentalRevenue = (float) Rental::where('status', 'active')->sum('weekly_rate');

        $total = $rideRevenue + $courierRevenue + $deliveryRevenue + $rentalRevenue;

        $distribution = [
            [
                'name' => 'Ride',
                'value' => $total > 0 ? round(($rideRevenue / $total) * 100, 1) : 25,
                'amount' => $rideRevenue,
                'color' => '#3b82f6',
            ],
            [
                'name' => 'Courier',
                'value' => $total > 0 ? round(($courierRevenue / $total) * 100, 1) : 25,
                'amount' => $courierRevenue,
                'color' => '#10b981',
            ],
            [
                'name' => 'Delivery',
                'value' => $total > 0 ? round(($deliveryRevenue / $total) * 100, 1) : 25,
                'amount' => $deliveryRevenue,
                'color' => '#f97316',
            ],
            [
                'name' => 'Rental',
                'value' => $total > 0 ? round(($rentalRevenue / $total) * 100, 1) : 25,
                'amount' => $rentalRevenue,
                'color' => '#a855f7',
            ],
        ];

        return response()->json($distribution);
    }

    /**
     * GET /api/admin/finance/quick-stats
     * Key financial KPIs.
     */
    public function getQuickStats(Request $request)
    {
        $completedTxCount = PaymentTransaction::where('status', 'completed')->count();
        $completedTxSum = (float) PaymentTransaction::where('status', 'completed')->sum('amount');

        $avgTransaction = $completedTxCount > 0 ? $completedTxSum / $completedTxCount : 0;

        // Transactions per day (last 30 days)
        $txLast30Days = PaymentTransaction::where('created_at', '>=', Carbon::now()->subDays(30))->count();
        $txPerDay = round($txLast30Days / 30);

        // Refund rate
        $totalTx = PaymentTransaction::count();
        $refundCount = PaymentTransaction::where('type', 'refund')->count();
        $refundRate = $totalTx > 0 ? round(($refundCount / $totalTx) * 100, 2) : 0;

        // Chargeback rate
        $chargebackCount = PaymentTransaction::where('type', 'chargeback')->count();
        $chargebackRate = $totalTx > 0 ? round(($chargebackCount / $totalTx) * 100, 2) : 0;

        // Collection rate (completed vs total)
        $collectionRate = $totalTx > 0
            ? round(($completedTxCount / $totalTx) * 100, 1)
            : 0;

        // Previous period comparisons (last 30 vs previous 30 days)
        $prevTxCount = PaymentTransaction::where('status', 'completed')
            ->whereBetween('created_at', [Carbon::now()->subDays(60), Carbon::now()->subDays(30)])
            ->count();
        $prevTxSum = (float) PaymentTransaction::where('status', 'completed')
            ->whereBetween('created_at', [Carbon::now()->subDays(60), Carbon::now()->subDays(30)])
            ->sum('amount');
        $prevAvg = $prevTxCount > 0 ? $prevTxSum / $prevTxCount : 0;

        $prevTxPerDay = round(PaymentTransaction::whereBetween('created_at', [Carbon::now()->subDays(60), Carbon::now()->subDays(30)])->count() / 30);

        return response()->json([
            ['label' => 'Avg Transaction Value', 'value' => '$' . number_format($avgTransaction, 2), 'change' => $this->calculateTrend($avgTransaction, $prevAvg), 'isPositive' => $avgTransaction >= $prevAvg],
            ['label' => 'Transactions/Day', 'value' => number_format($txPerDay), 'change' => $this->calculateTrend($txPerDay, $prevTxPerDay), 'isPositive' => $txPerDay >= $prevTxPerDay],
            ['label' => 'Refund Rate', 'value' => $refundRate . '%', 'change' => '0%', 'isPositive' => true],
            ['label' => 'Chargeback Rate', 'value' => $chargebackRate . '%', 'change' => '0%', 'isPositive' => true],
            ['label' => 'Collection Rate', 'value' => $collectionRate . '%', 'change' => '+0%', 'isPositive' => true],
        ]);
    }

    /**
     * GET /api/admin/finance/payment-methods
     * Revenue breakdown by payment method.
     */
    public function getPaymentMethods(Request $request)
    {
        $methods = PaymentTransaction::select('payment_method', DB::raw('SUM(amount) as total'))
            ->where('status', 'completed')
            ->whereNotNull('payment_method')
            ->groupBy('payment_method')
            ->orderByDesc('total')
            ->get();

        $colors = [
            'card' => 'bg-blue-600',
            'mobile_money' => 'bg-indigo-500',
            'wallet' => 'bg-purple-500',
            'cash' => 'bg-emerald-500',
        ];

        $result = $methods->map(function ($m) use ($colors) {
            $key = strtolower($m->payment_method);
            return [
                'name' => ucwords(str_replace('_', ' ', $m->payment_method)),
                'value' => (float) $m->total,
                'color' => $colors[$key] ?? 'bg-gray-500',
            ];
        });

        // If no data, return defaults with 0
        if ($result->isEmpty()) {
            $result = collect([
                ['name' => 'Credit/Debit Card', 'value' => 0, 'color' => 'bg-blue-600'],
                ['name' => 'Mobile Money', 'value' => 0, 'color' => 'bg-indigo-500'],
                ['name' => 'Wallet Balance', 'value' => 0, 'color' => 'bg-purple-500'],
                ['name' => 'Cash', 'value' => 0, 'color' => 'bg-emerald-500'],
            ]);
        }

        return response()->json($result);
    }

    /**
     * GET /api/admin/finance/pending-actions
     * Count of pending items that need admin attention.
     */
    public function getPendingActions(Request $request)
    {
        $pendingPayouts = PaymentTransaction::where('status', 'pending')
            ->whereIn('type', ['payout', 'withdrawal'])
            ->count();

        $failedTransactions = PaymentTransaction::where('status', 'failed')->count();

        $refundRequests = PaymentTransaction::where('type', 'refund')
            ->where('status', 'pending')
            ->count();

        // Vendors with pending settlements (vendors with orders but no recent completed payout)
        $vendorSettlements = Vendor::where('status', 'active')
            ->whereHas('deliveryOrders', function ($q) {
                $q->where('status', 'delivered');
            })
            ->count();

        // Tax filings (placeholder - could be based on time/month)
        $taxFilings = Carbon::now()->day <= 15 ? 3 : 0;

        return response()->json([
            ['label' => 'Pending payouts', 'count' => $pendingPayouts, 'color' => 'bg-red-500'],
            ['label' => 'Failed transactions', 'count' => $failedTransactions, 'color' => 'bg-red-500'],
            ['label' => 'Refund requests', 'count' => $refundRequests, 'color' => 'bg-gray-500'],
            ['label' => 'Vendor settlements', 'count' => $vendorSettlements, 'color' => 'bg-gray-200 text-gray-800'],
            ['label' => 'Tax filings due', 'count' => $taxFilings, 'color' => 'bg-gray-100 text-gray-600 border border-gray-300'],
        ]);
    }

    /**
     * GET /api/admin/finance/transactions
     * All transactions with search and filter support.
     */
    public function getTransactions(Request $request)
    {
        $query = PaymentTransaction::with('user')->latest();

        // Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'LIKE', "%{$search}%")
                  ->orWhere('reference', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($status = $request->query('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $transactions = $query->paginate($request->query('per_page', 15));

        $items = $transactions->getCollection()->map(function ($tx) {
            $fee = $tx->amount * 0.15; // 15% platform fee
            return [
                'id' => $tx->transaction_id,
                'type' => ucfirst($tx->type),
                'user' => [
                    'name' => $tx->user ? $tx->user->name : 'Unknown',
                    'avatar' => null,
                ],
                'order_id' => $tx->reference,
                'amount' => (float) $tx->amount,
                'fee' => round($fee, 2),
                'net' => round($tx->amount - $fee, 2),
                'method' => ucwords(str_replace('_', ' ', $tx->payment_method ?? 'N/A')),
                'status' => ucfirst($tx->status),
                'date' => $tx->processed_at ? $tx->processed_at->format('M d, Y') : $tx->created_at->format('M d, Y'),
            ];
        });

        return response()->json([
            'data' => $items,
            'current_page' => $transactions->currentPage(),
            'last_page' => $transactions->lastPage(),
            'total' => $transactions->total(),
            'per_page' => $transactions->perPage(),
        ]);
    }

    /**
     * GET /api/admin/finance/driver-payouts
     * Driver payout details with earnings, commission, deductions.
     */
    public function getDriverPayouts(Request $request)
    {
        $drivers = Driver::with('user')
            ->withCount('rides')
            ->withSum(['rides as total_earnings' => function ($q) {
                $q->where('payment_status', 'paid');
            }], 'fare')
            ->having('rides_count', '>', 0)
            ->paginate($request->query('per_page', 15));

        $items = $drivers->getCollection()->map(function ($driver, $index) {
            $earnings = (float) ($driver->total_earnings ?? 0);
            $commissionRate = 0.15; // 15% platform commission
            $commission = round($earnings * $commissionRate, 2);
            $deductions = 0; // Could add insurance, penalties etc.
            $netPayout = round($earnings - $commission - $deductions, 2);

            // Determine status based on payout existence
            $hasPendingPayout = PaymentTransaction::where('type', 'payout')
                ->where('status', 'pending')
                ->where('description', 'LIKE', "%driver:{$driver->id}%")
                ->exists();

            $hasCompletedPayout = PaymentTransaction::where('type', 'payout')
                ->where('status', 'completed')
                ->where('description', 'LIKE', "%driver:{$driver->id}%")
                ->exists();

            $status = $hasPendingPayout ? 'Pending' : ($hasCompletedPayout ? 'Completed' : 'Pending');

            return [
                'id' => 'PAY-' . str_pad($driver->id, 4, '0', STR_PAD_LEFT),
                'driver' => [
                    'name' => $driver->name,
                    'id' => $driver->driver_id ?? 'DRV-' . str_pad($driver->id, 4, '0', STR_PAD_LEFT),
                    'avatar' => $driver->image_url,
                ],
                'earnings' => $earnings,
                'commission' => $commission,
                'deductions' => $deductions,
                'net_payout' => $netPayout,
                'period' => Carbon::now()->startOfWeek()->format('M d') . '-' . Carbon::now()->endOfWeek()->format('d'),
                'status' => $status,
            ];
        });

        return response()->json([
            'data' => $items,
            'current_page' => $drivers->currentPage(),
            'last_page' => $drivers->lastPage(),
            'total' => $drivers->total(),
            'per_page' => $drivers->perPage(),
        ]);
    }

    /**
     * GET /api/admin/finance/vendor-settlements
     * Vendor settlement details with sales, commission, refunds.
     */
    public function getVendorSettlements(Request $request)
    {
        $vendors = Vendor::with('user')
            ->withCount('deliveryOrders')
            ->withSum(['deliveryOrders as total_sales' => function ($q) {
                $q->where('status', 'delivered');
            }], 'total_amount')
            ->having('delivery_orders_count', '>', 0)
            ->paginate($request->query('per_page', 15));

        $items = $vendors->getCollection()->map(function ($vendor) {
            $totalSales = (float) ($vendor->total_sales ?? 0);
            $commissionRate = $vendor->commission_rate ? $vendor->commission_rate / 100 : 0.15;
            $commission = round($totalSales * $commissionRate, 2);
            $refunds = 0; // From refund transactions linked to this vendor
            $netSettlement = round($totalSales - $commission - $refunds, 2);

            // Check payout status
            $status = 'Pending'; // Default

            return [
                'id' => 'SET-' . str_pad($vendor->id, 4, '0', STR_PAD_LEFT),
                'vendor' => [
                    'name' => $vendor->name,
                    'avatar' => $vendor->logo,
                ],
                'total_sales' => $totalSales,
                'commission' => $commission,
                'commission_rate' => round($commissionRate * 100) . '%',
                'refunds' => $refunds,
                'net_settlement' => $netSettlement,
                'period' => Carbon::now()->startOfMonth()->format('M d') . '-' . Carbon::now()->format('d'),
                'status' => $status,
            ];
        });

        return response()->json([
            'data' => $items,
            'current_page' => $vendors->currentPage(),
            'last_page' => $vendors->lastPage(),
            'total' => $vendors->total(),
            'per_page' => $vendors->perPage(),
        ]);
    }

    /**
     * GET /api/admin/finance/wallet-stats
     * User wallet overview statistics.
     */
    public function getWalletStats(Request $request)
    {
        $totalBalance = (float) User::sum('wallet_balance');
        $activeWallets = User::where('wallet_balance', '>', 0)->count();

        // Today's top-ups (wallet type transactions, credit)
        $todayTopups = (float) PaymentTransaction::where('type', 'payment')
            ->where('payment_method', 'wallet')
            ->where('status', 'completed')
            ->whereDate('processed_at', Carbon::today())
            ->where('amount', '>', 0)
            ->sum('amount');

        // Today's withdrawals
        $todayWithdrawals = (float) PaymentTransaction::where('type', 'withdrawal')
            ->where('status', 'completed')
            ->whereDate('processed_at', Carbon::today())
            ->sum('amount');

        // Yesterday's values for trends
        $yesterdayTopups = (float) PaymentTransaction::where('type', 'payment')
            ->where('payment_method', 'wallet')
            ->where('status', 'completed')
            ->whereDate('processed_at', Carbon::yesterday())
            ->where('amount', '>', 0)
            ->sum('amount');

        $yesterdayWithdrawals = (float) PaymentTransaction::where('type', 'withdrawal')
            ->where('status', 'completed')
            ->whereDate('processed_at', Carbon::yesterday())
            ->sum('amount');

        $prevActiveWallets = User::where('wallet_balance', '>', 0)
            ->where('updated_at', '<', Carbon::today())
            ->count();

        return response()->json([
            'total_balance' => $totalBalance,
            'active_wallets' => $activeWallets,
            'todays_topups' => $todayTopups,
            'todays_withdrawals' => $todayWithdrawals,
            'trends' => [
                'balance' => $this->calculateTrend($totalBalance, $totalBalance * 0.95),
                'active' => '+' . max(0, $activeWallets - $prevActiveWallets),
                'topups' => $this->calculateTrend($todayTopups, $yesterdayTopups),
                'withdrawals' => $this->calculateTrend($todayWithdrawals, $yesterdayWithdrawals),
            ],
        ]);
    }

    /**
     * GET /api/admin/finance/wallet-transactions
     * Wallet-related transactions list.
     */
    public function getWalletTransactions(Request $request)
    {
        $query = PaymentTransaction::with('user')
            ->where(function ($q) {
                $q->where('payment_method', 'wallet')
                  ->orWhereIn('type', ['withdrawal', 'refund']);
            })
            ->latest();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        $transactions = $query->paginate($request->query('per_page', 15));

        $items = $transactions->getCollection()->map(function ($tx) {
            $transactionType = 'Payment';
            if ($tx->type === 'withdrawal') $transactionType = 'Withdrawal';
            elseif ($tx->type === 'refund') $transactionType = 'Refund';
            elseif ($tx->amount > 0 && $tx->type === 'payment') $transactionType = 'Top-up';

            $amount = (float) $tx->amount;
            if (in_array($tx->type, ['withdrawal']) || $transactionType === 'Payment') {
                $amount = -abs($amount);
            }

            $userBalance = $tx->user ? (float) $tx->user->wallet_balance : 0;

            return [
                'id' => $tx->transaction_id,
                'user' => [
                    'name' => $tx->user ? $tx->user->name : 'Unknown',
                    'avatar' => null,
                ],
                'transaction' => $transactionType,
                'amount' => $amount,
                'balance_after' => $userBalance,
                'method' => ucwords(str_replace('_', ' ', $tx->payment_method ?? 'System')),
                'reference' => $tx->reference,
                'date' => $tx->processed_at ? $tx->processed_at->format('M d, Y') : $tx->created_at->format('M d, Y'),
            ];
        });

        return response()->json([
            'data' => $items,
            'current_page' => $transactions->currentPage(),
            'last_page' => $transactions->lastPage(),
            'total' => $transactions->total(),
            'per_page' => $transactions->perPage(),
        ]);
    }

    /**
     * Helper: Apply previous period date filter for trend comparison.
     */
    private function applyPreviousPeriodFilter($query, Request $request, $dateColumn = 'created_at')
    {
        $range = $request->query('range');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        if ($startDate && $endDate) {
            $start = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);
            $diff = $start->diffInDays($end);
            $query->whereBetween($dateColumn, [$start->copy()->subDays($diff + 1)->startOfDay(), $start->copy()->subDay()->endOfDay()]);
        } elseif ($range === 'today') {
            $query->whereDate($dateColumn, Carbon::yesterday());
        } elseif ($range === 'yesterday') {
            $query->whereDate($dateColumn, Carbon::now()->subDays(2));
        } elseif ($range === 'this_week') {
            $query->whereBetween($dateColumn, [Carbon::now()->subWeek()->startOfWeek(), Carbon::now()->subWeek()->endOfWeek()]);
        } elseif ($range === 'this_month') {
            $query->whereMonth($dateColumn, Carbon::now()->subMonth()->month)
                  ->whereYear($dateColumn, Carbon::now()->subMonth()->year);
        } elseif ($range === 'last_month') {
            $query->whereMonth($dateColumn, Carbon::now()->subMonths(2)->month)
                  ->whereYear($dateColumn, Carbon::now()->subMonths(2)->year);
        } elseif ($range === 'this_year') {
            $query->whereYear($dateColumn, Carbon::now()->subYear()->year);
        } else {
            // Default prev: last month
            $query->whereMonth($dateColumn, Carbon::now()->subMonth()->month)
                  ->whereYear($dateColumn, Carbon::now()->subMonth()->year);
        }

        return $query;
    }
}
