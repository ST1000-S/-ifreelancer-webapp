export interface ReviewUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface ReviewJob {
  id: string;
  title: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  reviewer?: ReviewUser;
  reviewee?: ReviewUser;
  job?: ReviewJob;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
  jobId: string;
  revieweeId: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
