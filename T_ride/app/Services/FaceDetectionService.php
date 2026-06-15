<?php

namespace App\Services;

use Aws\Rekognition\RekognitionClient;
use Illuminate\Support\Facades\Storage;

class FaceDetectionService
{
    protected RekognitionClient $rekognition;

    public function __construct()
    {
        $this->rekognition = new RekognitionClient([
            'version' => 'latest',
            'region' => env('AWS_REKOGNITION_REGION', env('AWS_TEXTRACT_REGION', 'us-east-2')),
            'credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
        ]);
    }

    public function analyzeProfilePhoto(string $path): array
    {
        $fullPath = Storage::disk('public')->path($path);

        if (!file_exists($fullPath)) {
            return [
                'status' => 'rejected',
                'reason' => 'Uploaded photo was not found.',
                'face_count' => 0,
            ];
        }

        try {
            $result = $this->rekognition->detectFaces([
                'Image' => [
                    'Bytes' => file_get_contents($fullPath),
                ],
                'Attributes' => ['ALL'],
            ]);

            $faces = $result['FaceDetails'] ?? [];
            $count = count($faces);

            if ($count < 1) {
                return [
                    'status' => 'rejected',
                    'reason' => 'No face detected. Please upload a clear profile photo.',
                    'face_count' => 0,
                ];
            }

            if ($count > 1) {
                return [
                    'status' => 'rejected',
                    'reason' => 'Multiple faces detected. Please upload only your own face.',
                    'face_count' => $count,
                ];
            }

            $face = $faces[0];
            $quality = $face['Quality'] ?? [];
            $brightness = (float) ($quality['Brightness'] ?? 0);
            $sharpness = (float) ($quality['Sharpness'] ?? 0);
            $confidence = (float) ($face['Confidence'] ?? 0);

            if ($confidence < 90) {
                return [
                    'status' => 'pending_review',
                    'reason' => 'Face detection confidence is low.',
                    'face_count' => 1,
                    'confidence' => $confidence,
                    'brightness' => $brightness,
                    'sharpness' => $sharpness,
                ];
            }

            if ($brightness < 30) {
                return [
                    'status' => 'rejected',
                    'reason' => 'Photo is too dark. Please upload a brighter photo.',
                    'face_count' => 1,
                    'confidence' => $confidence,
                    'brightness' => $brightness,
                    'sharpness' => $sharpness,
                ];
            }

            if ($sharpness < 30) {
                return [
                    'status' => 'rejected',
                    'reason' => 'Photo is too blurry. Please upload a clearer photo.',
                    'face_count' => 1,
                    'confidence' => $confidence,
                    'brightness' => $brightness,
                    'sharpness' => $sharpness,
                ];
            }

            return [
                'status' => 'approved',
                'reason' => null,
                'face_count' => 1,
                'confidence' => $confidence,
                'brightness' => $brightness,
                'sharpness' => $sharpness,
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'pending_review',
                'reason' => 'Face verification could not be completed automatically.',
                'error' => $e->getMessage(),
            ];
        }
    }
}
