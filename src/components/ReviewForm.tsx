import { StarIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { toast } from "sonner";

interface ReviewFormProps {
  jobId: string;
  revieweeId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ jobId, revieweeId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          revieweeId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit review");
      }

      toast.success("Review submitted successfully");
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-medium text-white mb-4">Write a Review</h3>

      {/* Rating Stars */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Rating
        </label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="p-1 focus:outline-none"
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(value)}
              aria-label={`Rate ${value} out of 5 stars`}
            >
              <StarIcon
                className={`h-8 w-8 ${
                  value <= (hoveredRating || rating)
                    ? "text-yellow-400"
                    : "text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Comment
        </label>
        <textarea
          id="comment"
          rows={4}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
