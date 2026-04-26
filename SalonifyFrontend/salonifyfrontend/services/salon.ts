import { apiFetch } from "@/lib/api";
import { mapSalonApiToUI } from "@/mappers/salon";
import { SalonApi,SalonSearchParams,UpdateSalonProfileRequest, WorkingDayApi } from "@/types/Salon";


export async function getMySalon() {
  const data= await apiFetch<SalonApi>("/api/salon/me");
    return mapSalonApiToUI(data);
}
export async function getAllSalons() {
  const data = await apiFetch<SalonApi[]>("/api/salon/all");
  return data.map(mapSalonApiToUI);
}

export async function updateSalonProfile(data: UpdateSalonProfileRequest) {
  return apiFetch<void>("/api/salon/update-profile", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}
export async function updateSalonImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<{ imageUrl: string }>("/api/salon/update-image", {
    method: "PUT",
    body: formData,
  });
}
export async function addSalonGalleryImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<{ imageUrl: string }>(
    "/api/salon/gallery",
    {
      method: "POST",
      body: formData,
    }
  );
}
export async function getMySalonWorkingDays() {
  return apiFetch<WorkingDayApi[]>("/api/salon/my-working-days");
}

export async function updateSalonWorkingDays(data: WorkingDayApi[]) {
  return apiFetch<void>("/api/salon/update-working-days", {
    method: "PUT",
    body: JSON.stringify({
      workingDays: data,
    }),
  });
}
export async function getSalonIdByUser(userId: string) {
  return apiFetch<{ salonId: string }>(
    `/api/salon/get-salon-id-by-user?userId=${userId}`
  );
}
export async function getSalonBySlugOrId(value: string) {
  const data= await apiFetch<SalonApi>(`/api/salon/get-salon-by-slug-or-id/${value}`);
  return mapSalonApiToUI(data);
}
export async function searchSalons(params: SalonSearchParams) {
  const query = new URLSearchParams();

  if (params.city) query.append("city", params.city);
  if (params.serviceType) query.append("serviceType", params.serviceType);
  if (params.minPrice != null) query.append("minPrice", String(params.minPrice));
  if (params.maxPrice != null) query.append("maxPrice", String(params.maxPrice));
  if (params.day != null) query.append("day", String(params.day));
  if (params.time) query.append("time", params.time);

  const data = await apiFetch<any>(`/api/salon/search?${query.toString()}`);

  const salons = Array.isArray(data) ? data : data.data ?? [];

  return salons.map(mapSalonApiToUI);
}