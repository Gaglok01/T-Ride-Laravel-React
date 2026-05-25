<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Driver;
use App\Models\City;
use App\Models\EnforcementRule;
use App\Models\DocumentQueueItem;

class TrustComplianceController extends Controller
{
    public function getDashboardStats()
    {
        $stats = [
            'compliant' => Driver::where('status', 'Compliant')->count(),
            'warning' => Driver::where('status', 'Warning')->count(),
            'non_compliant' => Driver::where('status', 'Non-Compliant')->count(),
            'restricted' => Driver::where('status', 'Restricted')->count(),
            'expiring_7d' => 0, // In real app, calculate based on dates
            'pending_review' => DocumentQueueItem::where('status', 'pending')->count(),
        ];

        return response()->json(['status' => true, 'data' => $stats]);
    }

    public function getDrivers()
    {
        $drivers = Driver::with('type')->get()->map(function($driver) {
            return [
                'db_id' => $driver->id,
                'id' => "DRV-" . str_pad($driver->id, 3, '0', STR_PAD_LEFT),
                'name' => $driver->name,
                'city' => $driver->city ?? 'Unknown',
                'license' => $driver->license_status ?? 'Valid',
                'insurance' => $driver->insurance_status ?? 'Valid',
                'background' => $driver->background_check_status ?? 'Cleared',
                'vehicle' => $driver->vehicle_status ?? 'Valid',
                'expiring' => $driver->expiring_in ?? '—',
                'dispatch' => $driver->account_status ?? 'Active',
                'status' => $driver->status ?? 'Compliant'
            ];
        });

        return response()->json(['status' => true, 'data' => $drivers]);
    }

    public function getDocumentQueue()
    {
        $queue = DocumentQueueItem::with('driver')
            ->where('status', 'pending')
            ->get()
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->driver->name,
                    'doc' => $item->document_type,
                    'city' => $item->city,
                    'submitted' => $item->created_at->diffForHumans()
                ];
            });

        return response()->json(['status' => true, 'data' => $queue]);
    }

    public function getCityRules()
    {
        $cities = City::all()->map(function($city) {
            return [
                'city' => $city->name,
                'license' => $city->license_renewal ?? 'Annual',
                'insurance' => $city->insurance_req ?? 'Third-Party',
                'background' => $city->background_freq ?? 'Annual',
                'inspection' => $city->vehicle_inspection ?? 'Annual',
                'age' => $city->min_age ?? 21
            ];
        });

        return response()->json(['status' => true, 'data' => $cities]);
    }

    public function getEnforcementRules()
    {
        $rules = EnforcementRule::all();
        
        // Seed if empty
        if ($rules->isEmpty()) {
            $defaultRules = [
                ['label' => 'Block dispatch on expired license', 'rule_key' => 'block_expired_license', 'enabled' => true],
                ['label' => 'Block dispatch on expired insurance', 'rule_key' => 'block_expired_insurance', 'enabled' => true],
                ['label' => 'Block dispatch on pending background check', 'rule_key' => 'block_pending_background', 'enabled' => true],
                ['label' => 'Block dispatch on failed vehicle inspection', 'rule_key' => 'block_failed_inspection', 'enabled' => true],
                ['label' => 'Send expiry warning (14 days before)', 'rule_key' => 'warning_14_days', 'enabled' => true],
                ['label' => 'Send expiry warning (7 days before)', 'rule_key' => 'warning_7_days', 'enabled' => true],
                ['label' => 'Auto-deactivate after 30 days expired', 'rule_key' => 'auto_deactivate_30d', 'enabled' => true],
                ['label' => 'Require re-onboarding after deactivation', 'rule_key' => 'require_reonboarding', 'enabled' => false],
            ];
            foreach ($defaultRules as $rule) {
                EnforcementRule::create($rule);
            }
            $rules = EnforcementRule::all();
        }

        return response()->json(['status' => true, 'data' => $rules]);
    }

    public function toggleEnforcementRule($id)
    {
        $rule = EnforcementRule::findOrFail($id);
        $rule->enabled = !$rule->enabled;
        $rule->save();

        return response()->json(['status' => true, 'data' => $rule]);
    }

    public function processDocument(Request $request, $id)
    {
        $item = DocumentQueueItem::findOrFail($id);
        $status = $request->status; // approved or rejected
        
        $item->status = $status;
        if ($status === 'rejected') {
            $item->rejection_reason = $request->reason;
        }
        $item->save();

        // Here you would typically update the Driver's document field or status
        
        return response()->json(['status' => true, 'message' => "Document " . ucfirst($status)]);
    }
}
