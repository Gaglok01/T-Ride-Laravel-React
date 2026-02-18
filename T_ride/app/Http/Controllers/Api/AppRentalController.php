<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RentableItem;
use App\Models\RentableBooking;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AppRentalController extends Controller
{
    /**
     * Get list of rentable items (Cars, Apartments, Houses)
     */
    public function getItems(Request $request)
    {
        $query = RentableItem::where('status', 'available');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $items = $query->latest()->get();

        return response()->json([
            'status' => true,
            'data' => $items
        ]);
    }

    /**
     * Get detail of a specific item
     */
    public function getItemDetail($id)
    {
        $item = RentableItem::find($id);

        if (!$item) {
            return response()->json(['status' => false, 'message' => 'Item not found'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $item
        ]);
    }

    /**
     * Book a rentable item
     */
    public function bookItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rentable_item_id' => 'required|exists:rentable_items,id',
            'user_name' => 'required|string',
            'user_phone' => 'required|string',
            'booking_details' => 'required|array',
            'total_price' => 'nullable|numeric',
            // Documents are handled separately or in same request as base64/files
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        $documents = [];
        $fileFields = ['cnic_front', 'cnic_back', 'driving_license', 'selfie', 'proof_of_income'];

        foreach ($fileFields as $field) {
            if ($request->hasFile($field)) {
                $path = $request->file($field)->store('rental_docs', 'public');
                $documents[$field] = $path;
            }
        }

        $booking = RentableBooking::create([
            'user_id' => Auth::id(),
            'rentable_item_id' => $request->rentable_item_id,
            'user_name' => $request->user_name,
            'user_phone' => $request->user_phone,
            'booking_details' => $request->booking_details,
            'documents' => $documents,
            'total_price' => $request->total_price,
            'status' => 'pending'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Booking request submitted successfully',
            'data' => $booking
        ]);
    }

    /**
     * Get user's rental bookings
     */
    public function getMyBookings()
    {
        $bookings = RentableBooking::where('user_id', Auth::id())
            ->with('item')
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'data' => $bookings
        ]);
    }
}
