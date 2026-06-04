export type Review = {
  id: string;
  userId: string;
  salonUserId: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  createdAt: string;
  appointmentId: string;
  userName?: string;
  serviceName?: string;
  serviceType?: number | string;
};
export type CreateReviewPayload = {
  appointmentId: string;
  rating: number;
  comment: string;
};
export type ReviewSearchParams = {
  minRating?: number | "all";
  serviceType?: number | "all";
  sortBy?: "newest" | "oldest" | "highest" | "lowest";
};

