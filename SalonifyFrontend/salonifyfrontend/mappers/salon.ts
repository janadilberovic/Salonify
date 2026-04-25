import { Salon } from "@/app/lib/data";
import { SalonApi } from "@/types/Salon";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function mapSalonApiToUI(salon: SalonApi): Salon {
  return {
    id: salon.id,
    slug: salon.slug || salon.id,
    name: salon.name || "Moj salon",
    tagline: salon.description || "Salon lepote",
    description: salon.description || "",
    city: salon.city || "Grad nije unet",
    address: salon.address || "Adresa nije uneta",
    phone: salon.phone || "Telefon nije unet",
    gallery: salon.galleryImageUrls?.map(getImageUrl) || [],
    cover:getImageUrl(salon.imageUrl),
    rating: 0,
    reviewCount: 0,
    categories: salon.services.map((s) => s.name),
    priceLevel: 2,
    openingHours: salon.workingDays.map((day) => ({
      day: String(day.day),
      hours:
        day.startTime && day.endTime
          ? `${day.startTime} - ${day.endTime}`
          : "Zatvoreno",
      closed: day.isClosed ?? false,
    })),
    services: salon.services.map((s) => ({
      id: String(s.serviceType),
      name: s.name,
      description: s.description || "",
      price: s.price,
      duration: s.durationMinutes,
      durationMinutes: s.durationMinutes,
      image: getImageUrl(s.imageUrl),
      imageUrl: getImageUrl(s.imageUrl) ,
      category: s.name,
      serviceType: s.serviceType,
    })),
  };
}

function getImageUrl(url?: string | null) {
  if (!url) return "/images/salon-placeholder.jpg";

  if (url.startsWith("http")) return url;

  return `${API_BASE_URL}${url}`;
}