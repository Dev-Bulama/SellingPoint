<?php

namespace App\Observers;

use App\Models\Review;

class ReviewObserver
{
    public function saved(Review $review): void
    {
        $this->recalculate($review);
    }

    public function deleted(Review $review): void
    {
        $this->recalculate($review);
    }

    private function recalculate(Review $review): void
    {
        $product = $review->product;
        if (!$product) return;

        // reviews() relationship already scopes to approved only
        $product->updateQuietly([
            'review_count'   => $product->reviews()->count(),
            'average_rating' => round((float) ($product->reviews()->avg('rating') ?? 0), 1),
        ]);
    }
}
