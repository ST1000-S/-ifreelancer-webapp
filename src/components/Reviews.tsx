import { Review } from "@/types/review";
import { ReviewCard } from "./ReviewCard";
import { StarIcon } from "@heroicons/react/20/solid";

interface ReviewsProps {
  reviews: Review[];
  showStats?: boolean;
}

export function Reviews({ reviews, showStats = true }: ReviewsProps) {
  // Calculate average rating
  const averageRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length ||
    0;

  // Calculate rating distribution
  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const count = reviews.filter((review) => review.rating === i + 1).length;
    const percentage = (count / reviews.length) * 100 || 0;
    return { rating: i + 1, count, percentage };
  }).reverse();

  return (
    <div className="space-y-8">
      {showStats && reviews.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Review Statistics
          </h3>

          {/* Average Rating */}
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-white mr-2">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating)
                        ? "text-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="ml-2 text-sm text-gray-400">
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center">
                <div className="w-24 flex items-center">
                  <span className="text-sm text-gray-400 mr-2">{rating}</span>
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm text-gray-400">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <p className="text-gray-400 text-center py-8">No reviews yet</p>
        )}
      </div>
    </div>
  );
}
