import { apiFetch } from "@/lib/api";

export async function getAverageReviewsForSalon(salonID: string) {
  return apiFetch<number>(
    `/api/review/get-average-reviews-for-salon?salonID=${salonID}`
  );
}