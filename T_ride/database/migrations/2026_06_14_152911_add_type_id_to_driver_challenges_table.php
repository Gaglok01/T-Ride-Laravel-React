<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTypeIdToDriverChallengesTable extends Migration
{
    public function up()
    {
        Schema::table('driver_challenges', function (Blueprint $table) {
            $table->unsignedBigInteger('type_id')->nullable()->after('service_type');
        });
    }

    public function down()
    {
        Schema::table('driver_challenges', function (Blueprint $table) {
            $table->dropColumn('type_id');
        });
    }
}
