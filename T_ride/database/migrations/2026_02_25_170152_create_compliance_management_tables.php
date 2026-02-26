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
        Schema::create('enforcement_rules', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->boolean('enabled')->default(true);
            $table->string('rule_key')->unique(); // e.g., 'block_expired_license'
            $table->timestamps();
        });

        Schema::create('document_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            $table->string('document_type');
            $table->string('file_path');
            $table->string('city');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enforcement_rules');
        Schema::dropIfExists('document_queue');
    }
};
