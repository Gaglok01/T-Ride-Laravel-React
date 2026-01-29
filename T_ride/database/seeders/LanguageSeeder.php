<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Language;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        $languages = [
            ['name' => 'English', 'code' => 'en', 'flag' => '🇺🇸'],
            ['name' => 'Arabic', 'code' => 'ar', 'flag' => '🇸🇦'],
            ['name' => 'French', 'code' => 'fr', 'flag' => '🇫🇷'],
            ['name' => 'Spanish', 'code' => 'es', 'flag' => '🇪🇸'],
            ['name' => 'Portuguese', 'code' => 'pt', 'flag' => '🇵🇹'],
            ['name' => 'German', 'code' => 'de', 'flag' => '🇩🇪'],
            ['name' => 'Italian', 'code' => 'it', 'flag' => '🇮🇹'],
            ['name' => 'Russian', 'code' => 'ru', 'flag' => '🇷🇺'],
            ['name' => 'Chinese (Simplified)', 'code' => 'zh', 'flag' => '🇨🇳'],
            ['name' => 'Japanese', 'code' => 'ja', 'flag' => '🇯🇵'],
            ['name' => 'Korean', 'code' => 'ko', 'flag' => '🇰🇷'],
            ['name' => 'Hindi', 'code' => 'hi', 'flag' => '🇮🇳'],
            ['name' => 'Urdu', 'code' => 'ur', 'flag' => '🇵🇰'],
            ['name' => 'Turkish', 'code' => 'tr', 'flag' => '🇹🇷'],
            ['name' => 'Persian', 'code' => 'fa', 'flag' => '🇮🇷'],
            ['name' => 'Dutch', 'code' => 'nl', 'flag' => '🇳🇱'],
            ['name' => 'Polish', 'code' => 'pl', 'flag' => '🇵🇱'],
            ['name' => 'Thai', 'code' => 'th', 'flag' => '🇹🇭'],
            ['name' => 'Vietnamese', 'code' => 'vi', 'flag' => '🇻🇳'],
            ['name' => 'Indonesian', 'code' => 'id', 'flag' => '🇮🇩'],
            ['name' => 'Bengali', 'code' => 'bn', 'flag' => '🇧🇩'],
            ['name' => 'Punjabi', 'code' => 'pa', 'flag' => '🇵🇰'],
            ['name' => 'Swahili', 'code' => 'sw', 'flag' => '🇰🇪'],
            ['name' => 'Malay', 'code' => 'ms', 'flag' => '🇲🇾'],
        ];

        foreach ($languages as $language) {
            Language::updateOrCreate(
                ['code' => $language['code']],
                $language
            );
        }
    }
}
