"use client";

import { useEffect, useMemo, useState } from "react";
import {
  acceptAppointment,
  getAppointmentsForSalon,
  rejectAppointment,
} from "@/services/appointment";
import { AppointmentApi } from "@/types/appointments";
import {
  AppointmentStatusMap,
  mapAppointmentStatusToSr,
  mapServiceTypeToSr,
} from "@/mappers/appointment";
import { getMySalon } from "@/services/salon";
import { getAverageReviewsForSalon } from "@/services/reviews";
import { AppointmentStatus } from "../components/ui";

export default function SalonDashboardPage() {
  const [appointments, setAppointments] = useState<AppointmentApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointmentsForSalon();

      const normalizedData = data.map((appointment) => ({
        ...appointment,
        status: normalizeStatus(appointment.status),
      }));

      setAppointments(normalizedData);
    } catch (error) {
      console.error("Greška pri učitavanju termina:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);
  useEffect(() => {
    loadAverageRating();
  }, []);
  const todayDate = new Date().toISOString().split("T")[0];
  async function loadAverageRating() {
    try {
      const salon = await getMySalon(); // ako već uzimaš salon
      const avg = await getAverageReviewsForSalon(salon.id);
      setAverageRating(avg);
    } catch (error) {
      console.error(error);
    }
  }
  const todayAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate)
        .toISOString()
        .split("T")[0];

      return appointmentDate === todayDate;
    });
  }, [appointments, todayDate]);
  const pendingAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => appointment.status === "Pending")
      .sort((a, b) => {
        const dateA = new Date(
          `${a.appointmentDate.split("T")[0]}T${a.startTime}`,
        );
        const dateB = new Date(
          `${b.appointmentDate.split("T")[0]}T${b.startTime}`,
        );

        return dateB.getTime() - dateA.getTime();
      });
  }, [appointments]);

  const todayRevenue = useMemo(() => {
    return todayAppointments
      .filter((appointment) => appointment.status === "Completed")
      .reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);
  }, [todayAppointments]);

  const handleAccept = async (appointmentId: string) => {
    try {
      setActionLoadingId(appointmentId);
      await acceptAppointment(appointmentId);
      await loadAppointments();
    } catch (error) {
      console.error("Greška pri odobravanju termina:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (appointmentId: string) => {
    try {
      setActionLoadingId(appointmentId);
      await rejectAppointment(appointmentId);
      await loadAppointments();
    } catch (error) {
      console.error("Greška pri odbijanju termina:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">
          Učitavanje dashboarda...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Pregled
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            Dobrodošli
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ovde vidite kratak pregled aktivnosti svog salona.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard
          title="Današnji termini"
          value={todayAppointments.length}
          description="Zakazivanja za danas"
          className="bg-purple-100"
        />

        <StatCard
          title="Na čekanju"
          value={pendingAppointments.length}
          description="Potrebno odobrenje"
          className="bg-pink-100"
        />

        <StatCard
          title="Prihod"
          value={`${todayRevenue} RSD`}
          description="Procena za aktivne termine"
          className="bg-green-100"
        />

        <StatCard
          title="Ocena"
          value={averageRating || "-"}
          description="Prosečna ocena salona"
          className="bg-blue-100"
        />
      </div>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Zahtevi na čekanju
            </h2>
            <p className="text-sm text-muted-foreground">
              Odobri ili odbij nove zahteve za termin.
            </p>
          </div>

          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
            {pendingAppointments.length} čeka
          </span>
        </div>

        <div className="space-y-3">
          {pendingAppointments.length === 0 ? (
            <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
              Trenutno nema zahteva na čekanju.
            </p>
          ) : (
            pendingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {getInitials(appointment.customerName)}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {appointment.customerName}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {mapServiceTypeToSr(appointment.serviceType)} •{" "}
                      {formatDate(appointment.appointmentDate)} •{" "}
                      {formatTime(appointment.startTime)} - {appointment.price}{" "}
                      RSD
                    </p>

                    {appointment.note && (
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        “{appointment.note}”
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(appointment.id)}
                    disabled={actionLoadingId === appointment.id}
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                  >
                    Odbij
                  </button>

                  <button
                    onClick={() => handleAccept(appointment.id)}
                    disabled={actionLoadingId === appointment.id}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    Odobri
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Današnji raspored
          </h2>
          <p className="text-sm text-muted-foreground">
            Pregled termina za danas.
          </p>
        </div>

        <div className="space-y-3">
          {todayAppointments.length === 0 ? (
            <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
              Za danas nema zakazanih termina.
            </p>
          ) : (
            todayAppointments
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background p-4"
                >
                  <div className="flex items-center gap-5">
                    <div className="min-w-20 border-r border-border pr-5">
                      <p className="text-lg font-semibold text-primary">
                        {formatTime(appointment.startTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        do {formatTime(appointment.endTime)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {mapServiceTypeToSr(appointment.serviceType)}
                      </h3>

                      <p className="text-xs text-muted-foreground">
                        {appointment.customerName}
                        {appointment.customerPhone &&
                          ` • ${appointment.customerPhone}`}
                      </p>
                    </div>
                  </div>

                  <span className={getStatusClassName(appointment.status)}>
                    {mapAppointmentStatusToSr(appointment.status)}
                  </span>
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  className,
}: {
  title: string;
  value: string | number;
  description: string;
  className: string;
}) {
  return (
    <div className={`rounded-3xl p-6 shadow-sm ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
        {title}
      </p>
      <h3 className="mt-4 text-3xl font-bold text-foreground">{value}</h3>
      <p className="mt-1 text-xs text-foreground/60">{description}</p>
    </div>
  );
}

function getInitials(name?: string) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

function getStatusClassName(status: AppointmentApi["status"]) {
  const baseClass = "rounded-full px-3 py-1 text-xs font-medium";

  switch (status) {
    case "Pending":
      return `${baseClass} bg-yellow-100 text-yellow-700`;
    case "Approved":
      return `${baseClass} bg-green-100 text-green-700`;
    case "Rejected":
      return `${baseClass} bg-red-100 text-red-700`;
    case "Cancelled":
      return `${baseClass} bg-gray-100 text-gray-600`;
    case "Completed":
      return `${baseClass} bg-blue-100 text-blue-700`;
    default:
      return `${baseClass} bg-gray-100 text-gray-600`;
  }
}
function mapStatus(status: number): AppointmentStatus {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Approved";
    case 2:
      return "Rejected";
    case 3:
      return "Cancelled";
    case 4:
      return "Completed";
    default:
      return "Pending";
  }
}
function normalizeStatus(status: string | number) {
  if (status === 0 || status === "0") return "Pending";
  if (status === 1 || status === "1") return "Approved";
  if (status === 2 || status === "2") return "Rejected";
  if (status === 3 || status === "3") return "Cancelled";
  if (status === 4 || status === "4") return "Completed";

  return status as
    | "Pending"
    | "Approved"
    | "Rejected"
    | "Cancelled"
    | "Completed";
}
