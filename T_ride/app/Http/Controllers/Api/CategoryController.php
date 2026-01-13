<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        return response()->json([
            'status' => true, 
            'message' => 'Category fetched successfully', 
            'data' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:categories,name'
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name), // Auto slug generate karega
            'icon' => $request->icon
        ]);

        return response()->json([
            'status' => true, 
            'message' => 'Category added successfully', 
            'data' => $category
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['status' => false, 'message' => 'Not found'], 404);

        $data = $request->all();
        if ($request->has('name')) {
            $data['slug'] = Str::slug($request->name);
        }

        $category->update($data);

        return response()->json([
            'status' => true, 
            'message' => 'Category updated successfully', 
            'data' => $category
        ]);
    }

    public function show($id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['status' => false, 'message' => 'Not found'], 404);

        return response()->json([
            'status' => true, 
            'message' => 'Category fetched successfully', 
            'data' => $category
        ]);
    }

    public function toggleStatus($id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['status' => false, 'message' => 'Not found'], 404);

        $category->status = !$category->status;
        $category->save();

        return response()->json([
            'status' => true,
            'message' => 'Category status changed successfully',
            'data' => $category
        ]);
    }

    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['status' => false, 'message' => 'Not found'], 404);

        $category->delete();
        return response()->json(['status' => true, 'message' => 'Category deleted successfully']);
    }
}