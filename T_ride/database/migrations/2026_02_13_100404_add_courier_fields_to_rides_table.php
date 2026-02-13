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
        Schema::table('rides', function (Blueprint $table) {
            $table->string('receiver_name')->nullable()->after('rider_id');
            $table->string('receiver_phone')->nullable()->after('receiver_name');
            $table->string('package_size')->nullable()->after('receiver_phone'); // e.g. 'small', 'medium', 'large'
            $table->decimal('package_weight', 8, 2)->nullable()->after('package_size'); // in kg
            $table->string('package_photo')->nullable()->after('package_weight');
            $table->text('pickup_instructions')->nullable()->after('pickup_address');
            $table->text('dropoff_instructions')->nullable()->after('dropoff_address');
            $table->enum('service_type', ['ride', 'courier', 'delivery'])->default('ride')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rides', function (Blueprint $table) {
            $table->dropColumn([
                'receiver_name',
                'receiver_phone',
                'package_size',
                'package_weight',
                'package_photo',
                'pickup_instructions',
                'dropoff_instructions',
                'service_type',
            ]);
        });
    }
};
