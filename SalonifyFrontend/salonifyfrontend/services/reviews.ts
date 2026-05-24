import { apiFetch } from "@/lib/api";
import {
  CreateReviewPayload,
  Review,
  ReviewSearchParams,
} from "@/types/Review";

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
): Promise<Review[]> {
  try {
    const allReviews = await apiFetch<Review[]>(
      `/api/review/get-reviews-for-salon?salonID=${salonId}`
    );

    if (!Array.isArray(allReviews)) {
      return [];
    }

    let filtered = [...allReviews];

    /**
     * Filtriranje po minimalnoj oceni.
     * params.minRating može da bude:
     * - number
     * - "all"
     * - undefined
     */
    const minRating =
      params.minRating !== undefined && params.minRating !== "all"
        ? Number(params.minRating)
        : undefined;

    if (typeof minRating === "number" && !Number.isNaN(minRating)) {
      filtered = filtered.filter((review) => review.rating >= minRating);
    }

    /**
     * Filtriranje po tipu usluge.
     *
     * Ovo sam namerno zakomentarisala jer tvoj Review tip trenutno
     * NEMA serviceType polje, zato ti puca:
     *
     * Property 'serviceType' does not exist on type 'Review'
     *
     * Ako backend ne vraća serviceType u recenziji, frontend ne može
     * da filtrira po tome.
     */
    // if (params.serviceType && params.serviceType !== "all") {
    //   filtered = filtered.filter(
    //     (review) => review.serviceType === params.serviceType
    //   );
    // }

    /**
     * Sortiranje recenzija.
     */
    switch (params.sortBy) {
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
        break;

      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;

      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;

      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
        break;
    }

    return filtered;
  } catch (error) {
    console.error("Greška pri filtriranju recenzija:", error);
    return [];
  }
}