
export type SalonService = {
  serviceType: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string | null;
  serviceName?: string;
};

export type AvailableService = {
  serviceType: number | string;
  name?: string;
  serviceName?: string;
};