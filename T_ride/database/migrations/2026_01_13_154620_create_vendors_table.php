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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('logo')->nullable();
            $table->integer('total_orders')->default(0);
            $table->decimal('total_revenue', 10, 2)->default(0.00);
            $table->decimal('rating', 2, 1)->default(0.0);
            $table->decimal('commission_rate', 5, 2)->default(0.00);
            $table->integer('status')->default(1);
            $table->boolean('is_open')->default(true);
            
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
