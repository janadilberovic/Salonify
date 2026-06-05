import { Salon, Service } from "@/app/lib/data";
import { SalonApi } from "@/types/Salon";
import { mapServiceTypeToSr } from "./appointment";
import { SalonService } from "@/types/SalonService";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function mapSalonApiToUI(salon: SalonApi): Salon {
  const services = salon.services ?? [];
  const workingDays = salon.workingDays ?? [];
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
    cover: getOptionalImageUrl(salon.imageUrl) || "",
    rating: 0,
    reviewCount: 0,
    categories: services.map((s) => s.name),
    priceLevel: 2,
    openingHours: workingDays.map((day) => ({
      day: String(normalizeDay(day.day)),
      hours:
        day.startTime && day.endTime
          ? `${day.startTime.slice(0, 5)} - ${day.endTime.slice(0, 5)}`
          : "Zatvoreno",
      closed: day.isClosed ?? false,
    })),
    services: services.map((s) => ({
      id: String(s.serviceType),
      name: s.name,
      description: s.description || "",
      price: s.price,
      duration: s.durationMinutes,
      durationMinutes: s.durationMinutes,
      image: getImageUrl(s.imageUrl),
      imageUrl: getImageUrl(s.imageUrl),
      category:  mapServiceTypeToSr(s.serviceType),
      serviceType: s.serviceType,
    })),
  };
}

function getImageUrl(url?: string | null) {
  if (!url) return "/images/salon-placeholder.jpg";

  if (url.startsWith("http")) return url;

  return `${API_BASE_URL}${url}`;
}

function getOptionalImageUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith("http")) return url;

  return `${API_BASE_URL}${url}`;
}
export function MapService(s: Service): SalonService {
  return {
    serviceType: getServiceTypeNumber(s.serviceType),
    name: s.name,
    description: s.description || "",
    price: s.price,
    durationMinutes: s.duration,
    imageUrl: s.image || "",
    serviceName: s.name,
  };
}

function normalizeDay(day: number | string) {
  if (typeof day === "number") return day;

  const parsed = Number(day);
  if (!Number.isNaN(parsed)) return parsed;

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    nedelja: 0,
    ponedeljak: 1,
    utorak: 2,
    sreda: 3,
    cetvrtak: 4,
    petak: 5,
    subota: 6,
  };

  return dayMap[String(day).trim().toLowerCase()] ?? 0;
}

function getServiceTypeNumber(serviceType?: string | number) {
  if (typeof serviceType === "number") {
    return serviceType;
  }

  if (typeof serviceType === "string") {
    const parsed = Number(serviceType);
    if (!Number.isNaN(parsed)) return parsed;

    const serviceTypeMap: Record<string, number> = {
      haircut: 0,
      coloring: 1,
      styling: 2,
      manicure: 3,
      pedicure: 4,
      makeup: 5,
      massage: 6,
      facial: 7,
      waxing: 8,
      spatreatment: 9,
      nailart: 10,
      other: 11,
    };

    return serviceTypeMap[serviceType.trim().toLowerCase()] ?? 11;
  }

  return 11;
}
