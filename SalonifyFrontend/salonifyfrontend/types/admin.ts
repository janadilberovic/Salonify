export type AdminStats = {
  totalUsers: number;
  totalSalons: number;
  totalAppointments: number;
  totalReviews: number;
  appointmentsByStatus: Record<string, number>;
  topSalons: TopSalon[];
};

export type TopSalon = {
  salonId: string;
  name: string;
  city: string;
  averageRating: number;
  reviewCount: number;
};

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  phone: string;
  profileImageUrl: string | null;
  createdAt: string;
};

export type AdminSalon = {
  id: string;
  userId: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  imageUrl: string | null;
  servicesCount: number;
  averageRating: number;
  reviewCount: number;
};

export type AdminReview = {
  id: string;
  salonId: string;
  salonName: string;
  userName: string;
  rating: number;
  comment: string;
  serviceName: string;
  createdAt: string;
};
