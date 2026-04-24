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
