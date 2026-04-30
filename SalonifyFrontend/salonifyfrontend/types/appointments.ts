export type AppointmentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Completed";

export type AppointmentApi = {
  id: string;
  userId: string;
  customerName:string;
  customerEmail:string;
  customerPhone:string;
  price:number;
  salonId: string;
  serviceType: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  note?: string | null;
  status: AppointmentStatus;
  createdAt: string;
};
export type UserAppointment = {
  id: string;
  salonId: string;
  salonName: string;
  salonImageUrl: string;
  serviceType: string;
  serviceImageUrl?: string;
  price: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  note?: string;
  status: AppointmentStatus;
  slug:string;
};
export type AvailableSlot = {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};
export type CreateAppointmentPayload = {
  salonId: string;
  serviceType: number | string;
  appointmentDate: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
};
