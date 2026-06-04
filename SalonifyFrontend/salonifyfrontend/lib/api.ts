const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const isFormData = options.body instanceof FormData;

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),

        ...(token ? { Authorization: `Bearer ${token}` } : {}),

        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      "API nije dostupan. Proveri da li backend radi i da li je dozvoljen frontend port."
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Došlo je do greške.");
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
