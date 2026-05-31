<?php

namespace App\Services;

use Google\Auth\Credentials\ServiceAccountCredentials;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmNotificationService
{
    public function sendToToken(string $token, string $title, string $body, array $data = []): bool
    {
        try {
            $keyPath = storage_path('app/firebase-service-account.json');

            $json = json_decode(file_get_contents($keyPath), true);
            $projectId = $json['project_id'] ?? null;

            if (!$projectId) {
                Log::error('FCM project_id missing');
                return false;
            }

            $scopes = ['https://www.googleapis.com/auth/firebase.messaging'];
            $credentials = new ServiceAccountCredentials($scopes, $keyPath);
            $authToken = $credentials->fetchAuthToken();

            $accessToken = $authToken['access_token'] ?? null;

            if (!$accessToken) {
                Log::error('FCM access token missing', ['auth' => $authToken]);
                return false;
            }

            $payload = [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => array_map('strval', array_merge([
                        'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                    ], $data)),
                    'android' => [
                        'priority' => 'HIGH',
                        'notification' => [
                            'sound' => 'default',
                            'channel_id' => 'ride_requests',
                        ],
                    ],
                ],
            ];

            $response = Http::withToken($accessToken)
                ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", $payload);

            Log::info('FCM v1 response', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error('FCM v1 send failed', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
