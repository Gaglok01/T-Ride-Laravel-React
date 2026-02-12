<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BackgroundCheckService
{
    protected string $baseUrl;
    protected string $apiToken;

    public function __construct()
    {
        $this->apiToken = config('services.backgroundchecks.api_token', '');
        $this->baseUrl = config('services.backgroundchecks.sandbox', false)
            ? 'https://sandbox.backgroundchecks.com/api'
            : 'https://app.backgroundchecks.com/api';
    }

    /**
     * Create a background check order for a driver.
     * Uses MVR (Motor Vehicle Records) for license verification.
     *
     * @param string $email Applicant email address
     * @param string $reportSku Report type: HIRE1 (Basic), HIRE2 (Standard), HIRE3 (Premium)
     * @param bool $includeMvr Include Motor Vehicle Records check (for license verification)
     * @return array
     */
    public function createOrder(string $email, string $reportSku = 'HIRE1', bool $includeMvr = false): array
    {
        try {
            $payload = [
                'report_sku' => $reportSku,
                'order_quantity' => 1,
                'applicant_emails' => [$email],
                'terms_agree' => 'Y',
                'mvr' => $includeMvr ? 'Y' : 'N',
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("{$this->baseUrl}/orders/new?api_token={$this->apiToken}", $payload);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('BackgroundCheck order created', ['response' => $data]);

                return [
                    'success' => true,
                    'data' => $data,
                    'report_key' => $data['applicants'][0]['report_key'] ?? null,
                ];
            }

            Log::error('BackgroundCheck order failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => 'Background check order failed: ' . $response->body(),
            ];

        } catch (\Exception $e) {
            Log::error('BackgroundCheck API error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Background check API error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check the status of a background check report.
     *
     * @param string $reportKey
     * @return array
     */
    public function checkStatus(string $reportKey): array
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->get("{$this->baseUrl}/reports/{$reportKey}/status?api_token={$this->apiToken}");

            if ($response->successful()) {
                $data = $response->json();

                // Map API status to our internal status
                $status = match ($data['status'] ?? '') {
                    'C' => 'verified',   // Complete
                    'P' => 'pending',    // Pending
                    'A' => 'pending',    // Awaiting Applicant
                    default => 'pending',
                };

                return [
                    'success' => true,
                    'status' => $status,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to check status: ' . $response->body(),
            ];

        } catch (\Exception $e) {
            Log::error('BackgroundCheck status check error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Status check error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get full report details.
     *
     * @param string $reportKey
     * @return array
     */
    public function getReport(string $reportKey): array
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->get("{$this->baseUrl}/report/{$reportKey}?api_token={$this->apiToken}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to get report: ' . $response->body(),
            ];

        } catch (\Exception $e) {
            Log::error('BackgroundCheck report error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Report error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Validate CNIC format (Pakistani CNIC: XXXXX-XXXXXXX-X or 13 digits).
     *
     * @param string $cnic
     * @return bool
     */
    public static function validateCnic(string $cnic): bool
    {
        // Remove dashes
        $cleaned = str_replace('-', '', $cnic);

        // Must be exactly 13 digits
        return preg_match('/^\d{13}$/', $cleaned) === 1;
    }

    /**
     * Validate driver's license number format.
     * Accepts alphanumeric, basic format validation.
     *
     * @param string $license
     * @return bool
     */
    public static function validateLicense(string $license): bool
    {
        // License should be at least 5 characters, alphanumeric with optional dashes
        $cleaned = str_replace(['-', ' '], '', $license);

        return strlen($cleaned) >= 5 && preg_match('/^[A-Za-z0-9]+$/', $cleaned) === 1;
    }
}
