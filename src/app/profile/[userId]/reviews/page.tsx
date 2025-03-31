import { Reviews } from "@/components/Reviews";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Review } from "@/types/review";

interface ReviewsPageProps {
  params: {
    userId: string;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      [key: number]: number;
    };
  };
}

async function getReviews(userId: string): Promise<ReviewsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/reviews?userId=${userId}`,
    {
      cache: "no-store",
    }
  );
  const data = await response.json();
  return data;
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { userId } = params;

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    notFound();
  }

  // Fetch reviews using the API route
  const { reviews } = await getReviews(userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">
          Reviews for {user.name || "User"}
        </h1>
        <Reviews reviews={reviews} />
      </div>
    </div>
  );
}
