export interface Review {
  id: number;
  user_name: string;
  rating: number; // 1-5 stars
  comment: string;
  created_at: string;
  helpful_count: number;
}

export interface RatingSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

