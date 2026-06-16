import { apiFetch } from "@/lib/api";

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
