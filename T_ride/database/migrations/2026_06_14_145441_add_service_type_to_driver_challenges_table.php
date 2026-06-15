<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddServiceTypeToDriverChallengesTable extends Migration
{
    public function up()
    {
        Schema::table('driver_challenges', function (Blueprint $table) {
            $table->string('service_type')->default('all')->after('target_value');
        });
    }

    public function down()
    {
        Schema::table('driver_challenges', function (Blueprint $table) {
            $table->dropColumn('service_type');
        });
    }
}
