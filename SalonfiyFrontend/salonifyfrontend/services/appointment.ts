import { apiFetch } from "@/lib/api";
import { AppointmentApi } from "@/types/appointments";

export async function getAppointmentsForSalon() {
  return apiFetch<AppointmentApi[]>("/api/appointments/get-appointments-for-salon");
}
export async function acceptAppointment(appointmentId: string) {
  return apiFetch<{ message: string; data: AppointmentApi }>(
    `/api/appointments/accept-appointment/${appointmentId}`,
    {
      method: "PUT",
    }
  );
}

export async function rejectAppointment(appointmentId: string) {
  return apiFetch<{ message: string; data: AppointmentApi }>(
    `/api/appointments/reject-appointment/${appointmentId}`,
    {
      method: "PUT",
    }
  );
}

export async function completeAppointment(appointmentId: string) {
  return apiFetch<{ message: string; data: AppointmentApi }>(
    `/api/appointments/completed-appointment/${appointmentId}`,
    {
      method: "PUT",
    }
  );
}