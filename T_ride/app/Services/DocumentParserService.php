<?php

namespace App\Services;

use Aws\Textract\TextractClient;
use Illuminate\Support\Facades\Storage;

class DocumentParserService
{
    protected TextractClient $textract;

    public function __construct()
    {
        $this->textract = new TextractClient([
            'version' => 'latest',
            'region' => env('AWS_TEXTRACT_REGION', 'us-east-2'),
            'credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
        ]);
    }

    public function extractTextFromStoragePath(string $path): string
    {
        $fullPath = Storage::disk('public')->path($path);

        if (!file_exists($fullPath)) {
            return '';
        }

        $result = $this->textract->detectDocumentText([
            'Document' => [
                'Bytes' => file_get_contents($fullPath),
            ],
        ]);

        $text = '';

        foreach (($result['Blocks'] ?? []) as $block) {
            if (($block['BlockType'] ?? '') === 'LINE') {
                $text .= ' ' . ($block['Text'] ?? '');
            }
        }

        return strtoupper($text);
    }

    public function parseText(string $text): array
    {
        $data = [];

        // VIN
        if (preg_match('/\b([A-HJ-NPR-Z0-9]{17})\b/', $text, $m)) {
            $data['vehicle_vin'] = $m[1];
        }

        // Nebraska plate, keeps spaces like YUF 639
        if (preg_match('/PLATE\s*#\s*([A-Z0-9]{2,4}\s*[A-Z0-9]{2,4})/i', $text, $m)) {
            $data['vehicle_plate_number'] = trim(preg_replace('/\s+/', ' ', $m[1]));
        }

        // Driver license number from Nebraska DLN
        if (preg_match('/\bDLN\s+([A-Z0-9]{5,20})\b/i', $text, $m)) {
            $data['license_number'] = $m[1];
        }

        // DOB
        if (preg_match('/\bDOB\s+([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i', $text, $m)) {
            $data['date_of_birth'] = date('Y-m-d', strtotime($m[1]));
        }

        // License expiration: Nebraska field 4B EXP
        if (preg_match('/\b4B\s+EXP\s+([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i', $text, $m)) {
            $data['license_expiration'] = date('Y-m-d', strtotime($m[1]));
        }

        // Registration expiration: EXPIRES MAY 2026
        if (preg_match('/EXPIRES\s+([A-Z]+)\s+(20[0-9]{2})/i', $text, $m)) {
            $date = date('Y-m-d', strtotime('last day of ' . $m[1] . ' ' . $m[2]));
            if ($date) {
                $data['insurance_expiration'] = $date;
            }
        }

        // Vehicle details: 2012 HONDA CR-V
        if (preg_match('/\b(19[8-9][0-9]|20[0-3][0-9])\s+(HONDA|TOYOTA|FORD|CHEVROLET|CHEVY|NISSAN|HYUNDAI|KIA|BMW|MERCEDES|LEXUS|MAZDA|DODGE|JEEP|SUBARU|VOLKSWAGEN)\s+([A-Z0-9\-\s]{1,30})/i', $text, $m)) {
            $data['vehicle_year'] = $m[1];
            $data['vehicle_make'] = ucfirst(strtolower($m[2]));
            $data['vehicle_model'] = trim($m[3]);
        }

        // Vehicle color
        if (preg_match('/\|\s*(BLACK|WHITE|GRAY|GREY|BLUE|RED|GREEN|SILVER|GOLD|YELLOW)\s*\|/i', $text, $m)
            || preg_match('/\b(BLACK|WHITE|GRAY|GREY|BLUE|RED|GREEN|SILVER|GOLD|YELLOW)\b/i', $text, $m)) {
            $data['vehicle_color'] = ucfirst(strtolower($m[1]));
        }

        // Insurance policy number only if real policy wording exists
        if (preg_match('/(?:POLICY\s*(?:NUMBER|NO\.?)?)\s*[:#-]?\s*([A-Z0-9\-]{5,30})/i', $text, $m)) {
            $data['insurance_policy_number'] = $m[1];
        }

        return $data;
    }
}
