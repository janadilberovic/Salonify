export type Review = {
  id: string;
  userId: string;
  salonUserId: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  createdAt: string;

  userName?: string;
  serviceName?: string;
};
