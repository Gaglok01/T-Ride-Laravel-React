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
        Schema::table('delivery_orders', function (Blueprint $table) {
            $table->string('delivery_address')->nullable()->after('status');
            $table->decimal('delivery_lat', 10, 8)->nullable()->after('delivery_address');
            $table->decimal('delivery_lng', 11, 8)->nullable()->after('delivery_lat');
            $table->string('contact_phone')->nullable()->after('delivery_lng');
            $table->text('delivery_instructions')->nullable()->after('contact_phone');
            $table->enum('payment_method', ['Cash', 'Wallet', 'Card'])->default('Cash')->after('total_amount');
            $table->decimal('delivery_fee', 8, 2)->default(0.00)->after('total_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('delivery_orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_address', 
                'delivery_lat', 
                'delivery_lng', 
                'contact_phone', 
                'delivery_instructions',
                'payment_method',
                'delivery_fee'
            ]);
        });
    }
};
