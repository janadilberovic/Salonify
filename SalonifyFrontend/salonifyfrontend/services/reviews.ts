import { apiFetch } from "@/lib/api";
import {
  CreateReviewPayload,
  Review,
  ReviewSearchParams,
} from "@/types/Review";

export async function getAverageReviewsForSalon(salonID: string) {
  const average = await apiFetch<number>(
    `/api/review/get-average-reviews-for-salon?salonID=${salonID}`
  );

  return Number(average.toFixed(2));
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
): Promise<Review[]> {
  try {
    const query = new URLSearchParams();

    if (params.minRating !== undefined && params.minRating !== "all") {
      query.set("minRating", String(params.minRating));
    }

    if (params.serviceType !== undefined && params.serviceType !== "all") {
      query.set("serviceType", String(params.serviceType));
    }

    if (params.sortBy) {
      query.set("sortBy", params.sortBy);
    }

    const reviews = await apiFetch<Review[]>(
      `/api/review/salon/${salonId}/search?${query.toString()}`
    );

    if (!Array.isArray(reviews)) {
      return [];
    }

    return reviews;
  } catch (error) {
    console.error("Greska pri filtriranju recenzija:", error);
    return [];
  }
}
