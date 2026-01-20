<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentProvider;
use App\Models\MobileMoneyProvider;
use App\Models\TransactionLimit;
use App\Models\PaymentTransaction;
use App\Models\WebhookConfiguration;
use App\Models\GatewaySetting;
use App\Models\FraudDetectionRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PaymentGatewayController extends Controller
{
    // Payment Providers
    public function getProvider($id)
    {
        $provider = PaymentProvider::findOrFail($id);
        
        // Fetch recent transactions for this provider
        $transactions = PaymentTransaction::with('user')
            ->where('payment_provider_id', $id)
            ->latest()
            ->take(10)
            ->get();

        $stats = [
            'total_processed' => PaymentTransaction::where('payment_provider_id', $id)->where('status', 'success')->sum('amount'),
            'transaction_count' => PaymentTransaction::where('payment_provider_id', $id)->count(),
            'success_rate' => PaymentTransaction::where('payment_provider_id', $id)->where('status', 'success')->count() / max(PaymentTransaction::where('payment_provider_id', $id)->count(), 1) * 100,
            'failed_count' => PaymentTransaction::where('payment_provider_id', $id)->where('status', 'failed')->count(),
        ];

        return response()->json([
            'status' => true,
            'data' => $provider,
            'transactions' => $transactions,
            'stats' => $stats
        ]);
    }

    public function getProviders()
    {
        $providers = PaymentProvider::all();
        $stats = [
            'total_processed' => PaymentProvider::sum('total_processed'),
            'success_rate' => PaymentProvider::avg('success_rate'),
            'failed_transactions' => PaymentTransaction::where('status', 'failed')->count(),
            'avg_processing_time' => '1.2s',
            'chargebacks' => PaymentTransaction::where('type', 'chargeback')->count(),
        ];

        return response()->json([
            'status' => true,
            'data' => $providers,
            'stats' => $stats
        ]);
    }

    public function storeProvider(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:payment_providers',
            'type' => 'required|in:card,mobile_money,wallet,bank_transfer',
            'api_key' => 'nullable|string',
            'secret_key' => 'nullable|string',
            'country' => 'nullable|string',
            'transaction_fee' => 'nullable|numeric|min:0',
            'transaction_limit' => 'nullable|numeric|min:0',
            'credentials' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $provider = PaymentProvider::create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Payment provider created successfully',
            'data' => $provider
        ], 201);
    }

    public function updateProvider(Request $request, $id)
    {
        $provider = PaymentProvider::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|unique:payment_providers,name,' . $id,
            'type' => 'required|in:card,mobile_money,wallet,bank_transfer',
            'api_key' => 'nullable|string',
            'secret_key' => 'nullable|string',
            'country' => 'nullable|string',
            'transaction_fee' => 'nullable|numeric|min:0',
            'transaction_limit' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
            'status' => 'nullable|in:active,inactive,maintenance',
            'credentials' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $provider->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Payment provider updated successfully',
            'data' => $provider
        ]);
    }

    public function configureProvider(Request $request, $id)
    {
        $provider = PaymentProvider::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'is_enabled' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $provider->update([
            'is_active' => $request->boolean('is_enabled')
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Provider configured successfully',
            'data' => $provider
        ]);
    }

    // Mobile Money Providers
    public function getMobileMoneyProviders()
    {
        $providers = MobileMoneyProvider::with('paymentProvider')->get();

        return response()->json([
            'status' => true,
            'data' => $providers
        ]);
    }

    public function storeMobileMoneyProvider(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_provider_id' => 'required|exists:payment_providers,id',
            'name' => 'required|string',
            'country' => 'required|string',
            'transaction_limit' => 'required|numeric|min:0',
            'fee_percentage' => 'required|numeric|min:0|max:100',
            'is_active' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $mobileMoneyProvider = MobileMoneyProvider::create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Mobile money provider created successfully',
            'data' => $mobileMoneyProvider
        ], 201);
    }

    // Transaction Limits
    public function getTransactionLimits()
    {
        $limits = TransactionLimit::all();

        return response()->json([
            'status' => true,
            'data' => $limits
        ]);
    }

    public function updateTransactionLimit(Request $request, $id)
    {
        $limit = TransactionLimit::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|numeric|min:0',
            'is_active' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $limit->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Transaction limit updated successfully',
            'data' => $limit
        ]);
    }

    // Card Processing Settings
    public function getCardSettings()
    {
        $cardSettings = GatewaySetting::where('setting_type', 'card_processing')->get();

        return response()->json([
            'status' => true,
            'data' => $cardSettings
        ]);
    }

    public function updateCardSettings(Request $request)
    {
        $settings = $request->all();

        foreach ($settings as $key => $value) {
            GatewaySetting::updateOrCreate(
                ['setting_name' => $key, 'setting_type' => 'card_processing'],
                ['value' => $value, 'is_enabled' => true]
            );
        }

        return response()->json([
            'status' => true,
            'message' => 'Card settings updated successfully',
            'data' => GatewaySetting::where('setting_type', 'card_processing')->get()
        ]);
    }

    // Fraud Prevention Settings
    public function getFraudSettings()
    {
        $fraudSettings = [
            'risk_score_threshold' => (int)GatewaySetting::where('setting_name', 'risk_score_threshold')->value('value') ?? 75,
            'block_suspicious_ips' => (bool)GatewaySetting::where('setting_name', 'block_suspicious_ips')->value('value') ?? true,
            'velocity_checks' => (bool)GatewaySetting::where('setting_name', 'velocity_checks')->value('value') ?? true,
            'cvv_verification' => (bool)GatewaySetting::where('setting_name', 'cvv_verification')->value('value') ?? true,
        ];

        return response()->json([
            'status' => true,
            'data' => $fraudSettings
        ]);
    }

    public function updateFraudSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'risk_score_threshold' => 'nullable|integer|min:0|max:100',
            'block_suspicious_ips' => 'nullable|boolean',
            'velocity_checks' => 'nullable|boolean',
            'cvv_verification' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $settings = [
            'risk_score_threshold' => 'risk_score_threshold',
            'block_suspicious_ips' => 'block_suspicious_ips',
            'velocity_checks' => 'velocity_checks',
            'cvv_verification' => 'cvv_verification'
        ];

        foreach ($settings as $key => $setting) {
            if ($request->has($key)) {
                GatewaySetting::updateOrCreate(
                    ['setting_name' => $setting, 'setting_type' => 'fraud'],
                    ['value' => $request->get($key), 'is_enabled' => true]
                );
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Fraud settings updated successfully',
            'data' => $this->getFraudSettings()->getOriginalContent()['data']
        ]);
    }

    // Webhook Configuration
    public function getWebhooks()
    {
        $webhooks = WebhookConfiguration::all();

        return response()->json([
            'status' => true,
            'data' => $webhooks
        ]);
    }

    public function storeWebhook(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'url' => 'required|url',
            'event_type' => 'required|string',
            'status' => 'nullable|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $webhook = WebhookConfiguration::create([
            'name' => $request->name,
            'url' => $request->url,
            'event_type' => $request->event_type,
            'status' => $request->status ?? 'active',
            'secret' => Str::random(32)
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Webhook created successfully',
            'data' => $webhook
        ], 201);
    }

    public function updateWebhook(Request $request, $id)
    {
        $webhook = WebhookConfiguration::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'url' => 'sometimes|url',
            'status' => 'sometimes|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $webhook->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Webhook updated successfully',
            'data' => $webhook
        ]);
    }

    public function deleteWebhook($id)
    {
        $webhook = WebhookConfiguration::findOrFail($id);
        $webhook->delete();

        return response()->json([
            'status' => true,
            'message' => 'Webhook deleted successfully'
        ]);
    }

    // Payment Transactions
    public function getTransactions(Request $request)
    {
        $query = PaymentTransaction::with('paymentProvider', 'user');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('provider_id')) {
            $query->where('payment_provider_id', $request->provider_id);
        }

        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('created_at', [$request->date_from, $request->date_to]);
        }

        $transactions = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => true,
            'data' => $transactions
        ]);
    }

    public function processTransaction(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_provider_id' => 'required|exists:payment_providers,id',
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string',
            'type' => 'required|in:payment,refund,chargeback',
            'payment_method' => 'nullable|string',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction = PaymentTransaction::create([
            'transaction_id' => 'TXN-' . Str::random(12),
            'reference' => 'REF-' . Str::random(10),
            'payment_provider_id' => $request->payment_provider_id,
            'user_id' => $request->user_id,
            'amount' => $request->amount,
            'currency' => $request->currency,
            'type' => $request->type,
            'status' => 'pending',
            'payment_method' => $request->payment_method,
            'description' => $request->description,
            'metadata' => $request->metadata
        ]);

        // Simulate transaction processing
        $transaction->update([
            'status' => 'success',
            'processed_at' => now()
        ]);

        // Update provider stats
        $provider = PaymentProvider::find($request->payment_provider_id);
        $provider->increment('transaction_count');
        $provider->increment('total_processed', $request->amount);

        return response()->json([
            'status' => true,
            'message' => 'Transaction processed successfully',
            'data' => $transaction
        ], 201);
    }

    // Dashboard Stats
    public function getDashboardStats()
    {
        $stats = [
            'total_processed' => PaymentTransaction::sum('amount'),
            'success_rate' => PaymentTransaction::where('status', 'success')->count() / max(PaymentTransaction::count(), 1) * 100,
            'failed_transactions' => PaymentTransaction::where('status', 'failed')->count(),
            'avg_processing_time' => '1.2s',
            'chargebacks' => PaymentTransaction::where('type', 'chargeback')->count()
        ];

        return response()->json([
            'status' => true,
            'data' => $stats
        ]);
    }
}
