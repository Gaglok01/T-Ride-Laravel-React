<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Table for specific commission rules (Rides, Deliveries, Courier, Vendors)
        if (!Schema::hasTable('commission_rules')) {
            Schema::create('commission_rules', function (Blueprint $table) {
                $table->id();
                $table->enum('type', ['ride', 'delivery', 'courier', 'vendor']);
                $table->string('name'); // e.g., 'Economy', 'Restaurants'
                $table->decimal('base_rate', 5, 2); // Percentage e.g. 15.00
                $table->decimal('min_commission', 10, 2)->nullable();
                $table->decimal('max_commission', 10, 2)->nullable();
                $table->string('surge_multiplier')->nullable(); // e.g. '1.5x', 'Same Rate'
                $table->json('attributes')->nullable(); // For vendor specific: featured_rate, new_vendor_rate, promo_period
                $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete(); // Null means 'All Cities'
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->timestamps();
            });
        }

        // Table for performance tiers (Drivers, Vendors)
        if (!Schema::hasTable('commission_tiers')) {
            Schema::create('commission_tiers', function (Blueprint $table) {
                $table->id();
                $table->enum('type', ['driver', 'vendor']);
                $table->string('name'); // e.g., 'Bronze', 'Starter'
                $table->integer('min_threshold'); // Trips or Orders count
                $table->integer('max_threshold')->nullable(); // Null for '5000+'
                $table->decimal('rate', 5, 2); // Commission rate (driver) or Discount (vendor)
                $table->string('description')->nullable();
                $table->timestamps();
            });
        }

        // Table for earnings history (Aggregated monthly data)
        if (!Schema::hasTable('commission_earnings')) {
            Schema::create('commission_earnings', function (Blueprint $table) {
                $table->id();
                $table->string('period'); // e.g., 'Nov 2024'
                $table->date('period_date'); // For sorting: '2024-11-01'
                $table->decimal('rides_revenue', 15, 2);
                $table->decimal('delivery_revenue', 15, 2);
                $table->decimal('courier_revenue', 15, 2);
                $table->decimal('total_revenue', 15, 2);
                $table->decimal('commission_earned', 15, 2);
                $table->decimal('avg_rate', 5, 2); // %
                $table->decimal('growth_percentage', 5, 2);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_earnings');
        Schema::dropIfExists('commission_tiers');
        Schema::dropIfExists('commission_rules');
    }
};
