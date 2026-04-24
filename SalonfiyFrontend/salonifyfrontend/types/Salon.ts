export type SalonApi = {
  id: string;
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