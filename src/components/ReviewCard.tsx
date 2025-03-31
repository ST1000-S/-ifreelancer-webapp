import { Review } from "@/types/review";
import { format } from "date-fns";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/20/solid";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-start space-x-4">
        {/* Reviewer Avatar */}
        <div className="flex-shrink-0">
          <div className="relative h-12 w-12">
            <Image
              src={review.reviewer?.image || "/default-avatar.png"}
              alt={review.reviewer?.name || "Anonymous"}
              fill
              className="rounded-full object-cover"
            />
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">
              {review.reviewer?.name || "Anonymous"}
            </p>
            <p className="text-sm text-gray-400">
              {format(new Date(review.createdAt), "MMM d, yyyy")}
            </p>
          </div>

          {/* Rating Stars */}
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-5 w-5 ${
                  i < review.rating ? "text-yellow-400" : "text-gray-600"
                }`}
              />
            ))}
          </div>

          {/* Review Text */}
          <p className="mt-3 text-gray-300 text-sm whitespace-pre-wrap">
            {review.comment}
          </p>

          {/* Job Reference */}
          <p className="mt-2 text-sm text-gray-400">
            For job: {review.job?.title || "Untitled Job"}
          </p>
        </div>
      </div>
    </div>
  );
}
