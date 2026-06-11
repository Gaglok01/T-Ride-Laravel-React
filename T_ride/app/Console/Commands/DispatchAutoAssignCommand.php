<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\DispatchController;

class DispatchAutoAssignCommand extends Command
{
    protected $signature = 'dispatch:auto-assign {--dry-run=0}';
    protected $description = 'Run T-Ride automatic dispatch assignment';

    public function handle()
    {
        $request = Request::create('/api/admin/dispatch/auto-assign', 'POST', [
            'dry_run' => (int) $this->option('dry-run'),
        ]);

        $response = app(DispatchController::class)->autoAssign($request);

        $this->info(json_encode(
            method_exists($response, 'getData') ? $response->getData(true) : $response,
            JSON_PRETTY_PRINT
        ));

        return 0;
    }
}
