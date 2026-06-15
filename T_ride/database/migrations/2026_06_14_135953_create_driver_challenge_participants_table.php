<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDriverChallengeParticipantsTable extends Migration
{
    public function up()
    {
        Schema::create('driver_challenge_participants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('driver_id');
            $table->unsignedBigInteger('challenge_id');
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamps();

            $table->unique(['driver_id', 'challenge_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('driver_challenge_participants');
    }
}
