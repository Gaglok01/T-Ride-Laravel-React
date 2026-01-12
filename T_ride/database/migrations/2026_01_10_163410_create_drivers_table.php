<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->string('driver_id')->unique();
            $table->string('name');
            $table->foreignId('type_id')->constrained('types')->cascadeOnDelete();
            $table->string('vehicle_model')->nullable();
            $table->unsignedInteger('trips')->default(0);
            $table->decimal('rating', 2, 1)->default(0);
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->json('documents')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
