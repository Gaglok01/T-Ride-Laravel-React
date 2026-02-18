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
        Schema::create('rentable_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('category', ['Car', 'Apartment', 'House']);
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->string('price_unit')->default('day'); // day, month
            $table->string('location')->nullable();
            $table->json('images')->nullable();
            $table->json('features')->nullable(); // JSON list of features
            $table->string('status')->default('available'); // available, rented, maintenance
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rentable_items');
    }
};
