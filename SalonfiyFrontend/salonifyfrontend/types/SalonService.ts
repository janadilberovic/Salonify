
export type SalonService = {
  serviceType: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string | null;
};