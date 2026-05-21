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
};
export type CreateReviewPayload = {
  appointmentId: string;
  rating: number;
  comment: string;
};
export type ReviewSearchParams = {
  minRating?: number;
  serviceType?: string;
  sortBy?: "newest" | "oldest" | "highest" | "lowest";
};