import { apiFetch } from "@/lib/api";
import { CreateReviewPayload, Review, ReviewSearchParams } from "@/types/Review";

export async function getAverageReviewsForSalon(salonID: string) {
  return apiFetch<number>(
    `/api/review/get-average-reviews-for-salon?salonID=${salonID}`
  );
}
export async function getReviewsForSalon(salonID: string) {
  return apiFetch<Review[]>(
    `/api/review/get-reviews-for-salon?salonID=${salonID}`
  );
}

export async function createReview(payload: CreateReviewPayload) {
  return apiFetch("/api/review/create-review", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function searchSalonReviews(
  salonId: string,
  params: ReviewSearchParams
) {
  const query = new URLSearchParams();

  if (params.minRating) {
    query.append("minRating", String(params.minRating));
  }

  if (params.serviceType && params.serviceType !== "all") {
    query.append("serviceType", params.serviceType);
  }

  if (params.sortBy) {
    query.append("sortBy", params.sortBy);
  }

  const qs = query.toString();

  return apiFetch<Review[]>(
    `/api/reviews/salon/${salonId}/search${qs ? `?${qs}` : ""}`
  );
}