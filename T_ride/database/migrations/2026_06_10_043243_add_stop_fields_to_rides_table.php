<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStopFieldsToRidesTable extends Migration
{
    public function up()
    {
        Schema::table('rides', function (Blueprint $table) {
            $table->string('stop_address')->nullable()->after('pickup_lng');
            $table->decimal('stop_lat', 10, 7)->nullable()->after('stop_address');
            $table->decimal('stop_lng', 10, 7)->nullable()->after('stop_lat');
        });
    }

    public function down()
    {
        Schema::table('rides', function (Blueprint $table) {
            $table->dropColumn(['stop_address', 'stop_lat', 'stop_lng']);
        });
    }
}
