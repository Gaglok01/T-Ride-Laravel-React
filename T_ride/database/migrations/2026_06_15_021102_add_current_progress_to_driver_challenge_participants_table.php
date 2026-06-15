<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCurrentProgressToDriverChallengeParticipantsTable extends Migration
{
    public function up()
    {
        Schema::table('driver_challenge_participants', function (Blueprint $table) {
            $table->integer('current_progress')->default(0)->after('challenge_id');
        });
    }

    public function down()
    {
        Schema::table('driver_challenge_participants', function (Blueprint $table) {
            $table->dropColumn('current_progress');
        });
    }
}
