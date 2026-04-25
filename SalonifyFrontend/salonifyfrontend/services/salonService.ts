import { SalonService } from "@/types/SalonService";
import { apiFetch } from "../lib/api";
export async function getMyServices() {
  return apiFetch<SalonService[]>("/api/salon/my-services");
}
export async function addSalonService(formData: FormData) {
  return apiFetch<void>("/api/salon/add-service", {
    method: "POST",
    body: formData,
  });
}

export async function removeSalonService(serviceType: number) {
  return apiFetch<void>(`/api/salon/remove-service/${serviceType}`, {
    method: "DELETE",
  });
}

export async function updateSalonService(formData: FormData) {
  return apiFetch<void>("/api/salon/update-service", {
    method: "PUT",
    body: formData,
  });
}

export async function getServicesFromSalon(salonId: string) {
  return apiFetch<SalonService[]>(
    `/api/salon/get-services-from-salon/${salonId}`
  );
}