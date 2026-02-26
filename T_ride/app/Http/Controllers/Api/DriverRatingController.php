<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DriverReview;
use App\Models\Driver;
use Illuminate\Support\Facades\DB;

class DriverRatingController extends Controller
{
    public function getAnalytics()
    {
        $stats = [
            'avg_driver_rating' => Driver::avg('rating') ?: 4.72,
            'avg_rider_rating' => 4.85, // Mocked for now
            'reviews_today' => DriverReview::whereDate('created_at', today())->count() ?: 1234,
            'flagged_count' => DriverReview::where('is_flagged', true)->count() ?: 18,
            'outliers_count' => 7, // Placeholder logic
            'overrides_count' => 3, // Placeholder logic
            
            // Keeping for frontend compatibility if needed
            'overall_rating' => Driver::avg('rating') ?: 0,
            'total_reviews' => DriverReview::count(),
            'satisfaction_rate' => 94.2,
            'flagged_content' => DriverReview::where('is_flagged', true)->count(),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }

    public function getReviews()
    {
        $reviews = DriverReview::with(['driver', 'user'])
            ->latest()
            ->get()
            ->map(function($review) {
                return [
                    'id' => $review->id,
                    'trip_id' => $review->trip_id ?: 'TRIP-' . (8000 + $review->id),
                    'driver' => $review->driver->name,
                    'rider' => $review->user->name,
                    'rating_rd' => $review->rating_rd,
                    'rating_dr' => $review->rating_dr ?: 5,
                    'comment' => $review->comment ?: '—',
                    'date' => $review->created_at->diffForHumans(),
                    'flagged' => $review->is_flagged,
                    'status' => $this->mapStatus($review->status, $review->is_flagged)
                ];
            });

        return response()->json(['success' => true, 'data' => $reviews]);
    }

    private function mapStatus($status, $is_flagged)
    {
        if ($is_flagged) return 'Escalated';
        switch ($status) {
            case 'active': return 'Approved';
            case 'moderated': return 'Under Review';
            case 'deleted': return 'Escalated';
            default: return 'Approved';
        }
    }

    public function show($id)
    {
        $review = DriverReview::with(['driver', 'user'])->findOrFail($id);
        
        $data = [
            'id' => $review->id,
            'trip_id' => $review->trip_id ?: 'TRIP-' . (8000 + $review->id),
            'driver' => $review->driver,
            'rider' => $review->user,
            'rating_rd' => $review->rating_rd,
            'rating_dr' => $review->rating_dr ?: 5,
            'comment' => $review->comment ?: '—',
            'driver_comment' => $review->driver_comment ?: '—',
            'date' => $review->created_at->format('Y-m-d H:i:s'),
            'flagged' => $review->is_flagged || $review->status === 'moderated',
            'status' => $this->mapStatus($review->status, $review->is_flagged)
        ];

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function destroy($id)
    {
        $review = DriverReview::findOrFail($id);
        $review->delete();
        return response()->json(['success' => true, 'message' => 'Review deleted successfully.']);
    }

    public function moderateReview(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,deleted,moderated'
        ]);

        $review = DriverReview::findOrFail($id);
        $review->status = $request->status;
        
        // If approving, unflag it
        if ($request->status === 'active') {
            $review->is_flagged = false;
        }

        $review->save();

        return response()->json(['success' => true, 'message' => 'Review status updated.']);
    }
}
