import { apiFetch } from "@/lib/api";

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  role: string;
  createdAt: string;
};

export type UpdateUserContactRequest = {
  displayName: string;
  phone: string;
};

export async function getMyUserProfile() {
  return apiFetch<UserProfile>("/api/user/me");
}

export async function updateMyUserContact(data: UpdateUserContactRequest) {
  return apiFetch<UserProfile>("/api/user/contact", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
