import { apiFetch } from "@/lib/api";
import { AppointmentApi,AvailableSlot,CreateAppointmentPayload,UserAppointment } from "@/types/appointments";

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
export async function getUserAppointments() {
  return apiFetch<UserAppointment[]>("/api/appointments/appointments-user");
}

export async function cancelAppointment(appointmentId: string) {
  return apiFetch(`/api/appointments/cancelled-appointment/${appointmentId}`, {
    method: "PUT",
  });
}
export async function getUpcomingAppointmentsForUser() {
  return apiFetch<AppointmentApi[]>(
    "/api/appointment/get-ucpoming-appointmetns-user"
  );
}
export async function getAvailableAppointmentsByDate(
  salonId: string,
  date: string,
  serviceT: number
): Promise<AvailableSlot[]> {
 const res = (await apiFetch(
    `/api/appointments/salon/${salonId}/get-available-appointments-by-date?date=${date}&serviceT=${serviceT}`
  )) as { data?: AvailableSlot[] };

  return res.data ?? [];
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  return apiFetch("/api/appointments/create-appointment", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}