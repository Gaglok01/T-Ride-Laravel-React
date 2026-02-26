<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ComplianceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update Cities with compliance rules
        \App\Models\City::where('name', 'Nairobi')->update([
            'license_renewal' => 'Biennial',
            'insurance_req' => 'Comprehensive',
            'background_freq' => 'Annual',
            'vehicle_inspection' => 'Biannual',
            'min_age' => 23
        ]);

        \App\Models\City::where('name', 'Sydney')->update([
            'license_renewal' => 'Annual',
            'insurance_req' => 'Full Cover',
            'background_freq' => 'Biannual',
            'vehicle_inspection' => 'Annual',
            'min_age' => 21
        ]);

        // Create Enforcement Rules if not exist (handled in controller but good to have here)
        $rules = [
            ['label' => 'Block dispatch on expired license', 'rule_key' => 'block_expired_license', 'enabled' => true],
            ['label' => 'Block dispatch on expired insurance', 'rule_key' => 'block_expired_insurance', 'enabled' => true],
            ['label' => 'Block dispatch on pending background check', 'rule_key' => 'block_pending_background', 'enabled' => true],
            ['label' => 'Block dispatch on failed vehicle inspection', 'rule_key' => 'block_failed_inspection', 'enabled' => true],
            ['label' => 'Send expiry warning (14 days before)', 'rule_key' => 'warning_14_days', 'enabled' => true],
            ['label' => 'Send expiry warning (7 days before)', 'rule_key' => 'warning_7_days', 'enabled' => true],
            ['label' => 'Auto-deactivate after 30 days expired', 'rule_key' => 'auto_deactivate_30d', 'enabled' => true],
            ['label' => 'Require re-onboarding after deactivation', 'rule_key' => 'require_reonboarding', 'enabled' => false],
        ];

        foreach ($rules as $rule) {
            \App\Models\EnforcementRule::updateOrCreate(['rule_key' => $rule['rule_key']], $rule);
        }

        // Add some items to Document Queue
        $driver = \App\Models\Driver::first();
        if ($driver) {
            \App\Models\DocumentQueueItem::updateOrCreate(
                ['driver_id' => $driver->id, 'document_type' => 'License Renewal'],
                [
                    'file_path' => 'docs/license_001.pdf',
                    'city' => $driver->city ?? 'Unknown',
                    'status' => 'pending'
                ]
            );
        }
    }
}
