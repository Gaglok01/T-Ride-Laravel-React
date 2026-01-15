<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TypeController extends Controller
{
    // 🔹 GET ALL
    public function index()
    {
        return response()->json(Type::all(), 200);
    }

    // 🔹 STORE
    public function store(Request $request)
    {
        $request->validate([
            'type_name' => 'required|string|max:255'
        ]);

        $type = Type::create([
            'type_name' => $request->type_name,
            'type_custom_id' => 'DT-' . strtoupper(Str::random(6)), // DT for Driver Type
        ]);

        return response()->json([
            'message' => 'Type created successfully',
            'data' => $type
        ], 201);
    }

    // 🔹 GET SINGLE
    public function show($id)
    {
        $type = Type::findOrFail($id);
        return response()->json($type, 200);
    }

    // 🔹 UPDATE
    public function update(Request $request, $id)
    {
        $request->validate([
            'type_name' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:active,inactive'
        ]);

        $type = Type::findOrFail($id);
        $type->update($request->only(['type_name', 'status']));

        return response()->json([
            'message' => 'Type updated successfully',
            'data' => $type
        ], 200);
    }

    // 🔹 DELETE
    public function destroy($id)
    {
        $type = Type::findOrFail($id);
        $type->delete();

        return response()->json([
            'message' => 'Type deleted successfully'
        ], 200);
    }
}
