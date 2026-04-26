export type SalonApi = {
  id: string;
  slug:string;
  userId: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  workingDays: WorkingDayApi[];
  imageUrl: string | null;
  galleryImageUrls: string[];
  services: ServiceApi[];
};

export type WorkingDayApi = {
  day: number;
  startTime: string | null;
  endTime: string | null;
  isClosed: boolean;
};

export type ServiceApi = {
  serviceType: number;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  imageUrl?: string | null;
};
export type UpdateSalonProfileRequest = {
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
};
export type SalonSearchParams = {
  city?: string | null;
  serviceType?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  day?: number | null;
  time?: string | null;
};