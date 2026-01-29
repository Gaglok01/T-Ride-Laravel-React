<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LanguageController extends Controller
{
    public function index()
    {
        $languages = \App\Models\Language::where('status', true)->get();
        return response()->json([
            'status' => true,
            'message' => 'Languages fetched successfully',
            'data' => $languages
        ]);
    }
}
