import { apiFetch } from "@/lib/api";
import { Review } from "@/types/Review";

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