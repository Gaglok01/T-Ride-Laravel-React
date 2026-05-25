<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE drivers MODIFY background_check_status ENUM('not_checked','not_started','pending','in_progress','clear','failed','approved','rejected') NOT NULL DEFAULT 'not_started'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE drivers MODIFY background_check_status ENUM('not_checked','pending','approved','rejected') NOT NULL DEFAULT 'not_checked'");
    }
};
