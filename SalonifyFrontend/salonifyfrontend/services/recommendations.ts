import { apiFetch } from "@/lib/api";
import { mapSalonApiToUI } from "@/mappers/salon";
import { SalonApi } from "@/types/Salon";

export type RecommendedSalon = {
  salonId: string;
  salonName: string;
  similarityScore: number;
  salon: ReturnType<typeof mapSalonApiToUI>;
  reasonServiceType: string | number;
  reasonServiceName?: string | null;
  reasonActivityType?: string | number | null;
};

type RecommendedSalonApi = {
  salonId: string;
  salonName: string;
  similarityScore: number;
  salon: SalonApi;
  reasonServiceType: string | number;
  reasonServiceName?: string | null;
  reasonActivityType?: string | number | null;
};

export async function getRecommendedSalons() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    return [];
  }

  const data = await apiFetch<RecommendedSalonApi[]>("/api/recommendations");

  return data.map((item) => ({
    ...item,
    salon: mapSalonApiToUI(item.salon),
  }));
}
