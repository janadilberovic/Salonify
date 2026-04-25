const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5199";

export function getImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return "/placeholder-service.jpg";

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${API_URL}${imageUrl}`;
}