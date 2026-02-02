<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    /**
     * Get all products (Admin) or vendor's own products (Vendor)
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Check if user is vendor
        if ($user->hasRole('vendor')) {
            $vendor = $user->vendor;
            if (!$vendor) {
                return response()->json([
                    'status' => false,
                    'message' => 'Vendor profile not found'
                ], 404);
            }
            $query = Product::where('vendor_id', $vendor->id);
        } else {
            // Admin can see all products or filter by vendor
            $query = Product::with('vendor');
            if ($request->has('vendor_id') && $request->vendor_id != null) {
                $query->where('vendor_id', $request->vendor_id);
            }
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $products = $query->latest()->get();

        return response()->json([
            'status' => true,
            'message' => 'Products fetched successfully',
            'data' => $products
        ]);
    }

    /**
     * Store a new product
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'image' => 'nullable|file|image|max:2048',
            'stock' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:100',
            'is_featured' => 'nullable|boolean',
            'vendor_id' => 'nullable|exists:vendors,id', // Only for admin
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Determine vendor_id
        if ($user->hasRole('vendor')) {
            $vendor = $user->vendor;
            if (!$vendor) {
                return response()->json([
                    'status' => false,
                    'message' => 'Vendor profile not found'
                ], 404);
            }
            $vendorId = $vendor->id;
        } else {
            // Admin must provide vendor_id
            if (!$request->vendor_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Vendor ID is required'
                ], 422);
            }
            $vendorId = $request->vendor_id;
        }

        $image = null;
        if ($request->hasFile('image')) {
            $image = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'vendor_id' => $vendorId,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'sale_price' => $request->sale_price,
            'image' => $image,
            'stock' => $request->stock ?? 0,
            'sku' => $request->sku,
            'is_featured' => $request->is_featured ?? false,
            'is_active' => true
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Product created successfully',
            'data' => $product
        ]);
    }

    /**
     * Show a specific product
     */
    public function show($id)
    {
        $user = Auth::user();
        $product = Product::with('vendor')->find($id);

        if (!$product) {
            return response()->json(['status' => false, 'message' => 'Product not found'], 404);
        }

        // Vendor can only see their own products
        if ($user->hasRole('vendor')) {
            $vendor = $user->vendor;
            if (!$vendor || $product->vendor_id !== $vendor->id) {
                return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Product details fetched',
            'data' => $product
        ]);
    }

    /**
     * Update a product
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['status' => false, 'message' => 'Product not found'], 404);
        }

        // Vendor can only update their own products
        if ($user->hasRole('vendor')) {
            $vendor = $user->vendor;
            if (!$vendor || $product->vendor_id !== $vendor->id) {
                return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
            }
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'image' => 'nullable|file|image|max:2048',
            'stock' => 'integer|min:0',
            'sku' => 'nullable|string|max:100',
            'is_featured' => 'boolean',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $image = $request->file('image')->store('products', 'public');
            $product->image = $image;
        }

        $product->name = $request->name ?? $product->name;
        $product->description = $request->description ?? $product->description;
        $product->price = $request->price ?? $product->price;
        $product->sale_price = $request->sale_price ?? $product->sale_price;
        $product->stock = $request->stock ?? $product->stock;
        $product->sku = $request->sku ?? $product->sku;
        $product->is_featured = $request->is_featured ?? $product->is_featured;
        $product->is_active = $request->is_active ?? $product->is_active;
        $product->save();

        return response()->json([
            'status' => true,
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    /**
     * Toggle product status
     */
    public function toggleStatus($id)
    {
        $user = Auth::user();
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['status' => false, 'message' => 'Product not found'], 404);
        }

        // Vendor can only toggle their own products
        if ($user->hasRole('vendor')) {
            $vendor = $user->vendor;
            if (!$vendor || $product->vendor_id !== $vendor->id) {
                return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
            }
        }

        $product->is_active = !$product->is_active;
        $product->save();

        return response()->json([
            'status' => true,
            'message' => 'Product status updated successfully',
            'data' => $product
        ]);
    }

    /**
     * Delete a product
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['status' => false, 'message' => 'Product not found'], 404);
        }

        // Vendor can only delete their own products
        if ($user->hasRole('vendor')) {
            $vendor = $user->vendor;
            if (!$vendor || $product->vendor_id !== $vendor->id) {
                return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
            }
        }

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $product->delete();

        return response()->json([
            'status' => true,
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Get vendor dashboard stats
     */
    public function getVendorDashboardStats()
    {
        $user = Auth::user();
        
        if (!$user->hasRole('vendor')) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 403);
        }

        $vendor = $user->vendor;
        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor profile not found'], 404);
        }

        $totalProducts = Product::where('vendor_id', $vendor->id)->count();
        $activeProducts = Product::where('vendor_id', $vendor->id)->where('is_active', true)->count();
        $featuredProducts = Product::where('vendor_id', $vendor->id)->where('is_featured', true)->count();
        $lowStockProducts = Product::where('vendor_id', $vendor->id)->where('stock', '<', 10)->count();

        return response()->json([
            'status' => true,
            'message' => 'Dashboard stats fetched',
            'data' => [
                'vendor' => $vendor,
                'stats' => [
                    [
                        'title' => 'Total Products',
                        'value' => (string)$totalProducts,
                        'trend' => '+0%',
                        'icon' => 'Package'
                    ],
                    [
                        'title' => 'Active Products',
                        'value' => (string)$activeProducts,
                        'trend' => '+0%',
                        'icon' => 'CheckCircle'
                    ],
                    [
                        'title' => 'Featured Products',
                        'value' => (string)$featuredProducts,
                        'trend' => '+0%',
                        'icon' => 'Star'
                    ],
                    [
                        'title' => 'Low Stock',
                        'value' => (string)$lowStockProducts,
                        'trend' => '0',
                        'icon' => 'AlertTriangle'
                    ]
                ],
                'recentProducts' => Product::where('vendor_id', $vendor->id)->latest()->limit(5)->get()
            ]
        ]);
    }
}
