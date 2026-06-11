<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\DispatchController;

class RunAutoDispatch extends Command
{
    protected $signature = 'dispatch:auto-run';
    protected $description = 'Run T-Ride auto dispatch engine';

    public function handle()
    {
        try {
            $response = app(DispatchController::class)->autoAssign(
                new Request(['dry_run' => false])
            );

            $this->info('Auto dispatch executed.');
            return 0;
        } catch (\Throwable $e) {
            \Log::error('dispatch:auto-run failed', [
                'error' => $e->getMessage(),
            ]);

            $this->error($e->getMessage());
            return 1;
        }
    }
}
