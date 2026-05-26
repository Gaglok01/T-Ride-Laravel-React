<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class DocumentParserService
{
    public function extractTextFromStoragePath(string $path): string
    {
        $fullPath = Storage::disk('public')->path($path);

        if (!file_exists($fullPath)) {
            return '';
        }

        $cmd = 'tesseract ' . escapeshellarg($fullPath) . ' stdout 2>/dev/null';

        return strtoupper(shell_exec($cmd) ?? '');
    }

    public function parseText(string $text): array
    {
        $data = [];

        if (preg_match('/\b[A-HJ-NPR-Z0-9]{17}\b/', $text, $m)) {
            $data['vehicle_vin'] = $m[0];
        }

        if (preg_match('/(?:PLATE|LICENSE PLATE|TAG)[:\s#-]*([A-Z0-9\-]{2,10})/i', $text, $m)) {
            $data['vehicle_plate_number'] = $m[1];
        }

        if (preg_match('/\b(19[8-9][0-9]|20[0-3][0-9])\b/', $text, $m)) {
            $data['vehicle_year'] = $m[1];
        }

        if (preg_match('/(?:EXP|EXPIRES|EXPIRATION)[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i', $text, $m)) {
            $date = date('Y-m-d', strtotime($m[1]));
            if ($date) {
                $data['license_expiration'] = $date;
                $data['insurance_expiration'] = $date;
            }
        }

        if (preg_match('/(?:LIC|LICENSE|DL|DLN)[:\s#-]*([A-Z0-9]{5,20})/i', $text, $m)) {
            $data['license_number'] = $m[1];
        }

        

        // Vehicle color
        if (preg_match('/\b(BLACK|WHITE|GRAY|GREY|BLUE|RED|GREEN|SILVER|GOLD|YELLOW)\b/i', $text, $m)) {
            $data['vehicle_color'] = ucfirst(strtolower($m[1]));
        }

        // Insurance policy number
        if (preg_match('/(?:POLICY|POLICY NO|POLICY NUMBER)[:\s#-]*([A-Z0-9\-]+)/i', $text, $m)) {
            $data['insurance_policy_number'] = $m[1];
        }

        // Driver name - disabled for now to avoid false positives from app screenshots.
        // Real ID name extraction will be added with a stronger OCR provider such as AWS Textract.


        return $data;
    }
}
