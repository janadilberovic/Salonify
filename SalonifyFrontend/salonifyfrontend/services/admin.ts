import { apiFetch } from "@/lib/api";
import {
  AdminReview,
  AdminSalon,
  AdminStats,
  AdminUser,
} from "@/types/admin";

type AdminActionResponse = {
  message: string;
};

export async function refreshSalonFeatureVectors() {
  return apiFetch<AdminActionResponse>(
    "/api/recommendations/refresh-salon-feature-vectors",
    {
      method: "POST",
    }
  );
}

export async function normalizeUserPreferenceVectors() {
  return apiFetch<AdminActionResponse>(
    "/api/recommendations/normalize-user-preference-vectors",
    {
      method: "POST",
    }
  );
}

export async function getAdminStats() {
  return apiFetch<AdminStats>("/api/admin/stats");
}

export async function getAllUsers() {
  return apiFetch<AdminUser[]>("/api/admin/get-all-users");
}

export async function deleteUser(userId: string) {
  return apiFetch<null>(`/api/admin/delete-user/${userId}`, {
    method: "DELETE",
  });
}

export async function getAllSalonsAdmin() {
  return apiFetch<AdminSalon[]>("/api/admin/get-all-salons");
}

export async function deleteSalonAdmin(salonId: string) {
  return apiFetch<null>(`/api/admin/delete-salon/${salonId}`, {
    method: "DELETE",
  });
}

export async function getAllReviewsAdmin() {
  return apiFetch<AdminReview[]>("/api/admin/get-all-reviews");
}

export async function deleteReviewAdmin(reviewId: string) {
  return apiFetch<null>(`/api/review/delete-review/${reviewId}`, {
    method: "DELETE",
  });
}
