<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Type;
use Illuminate\Http\Request;

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
            'type_name' => $request->type_name
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
            'type_name' => 'required|string|max:255'
        ]);

        $type = Type::findOrFail($id);
        $type->update([
            'type_name' => $request->type_name
        ]);

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
