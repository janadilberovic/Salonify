"use client";

import { useEffect, useState } from "react";
import { StatusBadge, Button, Avatar, EyebrowLabel } from "../../components/ui";

import {
  getAppointmentsForSalon,
  acceptAppointment,
  rejectAppointment,
  completeAppointment,
} from "@/services/appointment";

import { AppointmentApi } from "@/types/appointments";

import {
  mapServiceTypeToSr,
  mapAppointmentStatusToSr,
} from "@/mappers/appointment";

const APPT_TABS = [
  "All",
  "Pending",
  "Approved",
  "Completed",
  "Rejected",
  "Cancelled",
] as const;

type TabType = (typeof APPT_TABS)[number];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentApi[]>([]);
  const [tab, setTab] = useState<TabType>("All");
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentApi | null>(null);
  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      const data = await getAppointmentsForSalon();

      setAppointments(
        data.map((appointment) => ({
          ...appointment,
          status: normalizeStatus(appointment.status),
        })),
      );
    } catch (error) {
      console.error("Greška pri učitavanju termina:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id: string) {
    try {
      const res = await acceptAppointment(id);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...res.data, status: normalizeStatus(res.data.status) }
            : a,
        ),
      );
    } catch (error) {
      console.error("Greška pri odobravanju termina:", error);
      alert("Greška pri odobravanju termina.");
    }
  }

  async function handleReject(id: string) {
    try {
      const res = await rejectAppointment(id);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...res.data, status: normalizeStatus(res.data.status) }
            : a,
        ),
      );
    } catch (error) {
      console.error("Greška pri odbijanju termina:", error);
      alert("Greška pri odbijanju termina.");
    }
  }

  async function handleComplete(id: string) {
    try {
      const res = await completeAppointment(id);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...res.data, status: normalizeStatus(res.data.status) }
            : a,
        ),
      );
    } catch (error) {
      console.error("Greška pri završavanju termina:", error);
      alert("Greška pri završavanju termina.");
    }
  }

  const filteredAppointments = appointments
  .filter((a) => (tab === "All" ? true : a.status === tab))
  .sort((a, b) => {
    const dateA = new Date(
      `${a.appointmentDate.split("T")[0]}T${a.startTime}`
    );

    const dateB = new Date(
      `${b.appointmentDate.split("T")[0]}T${b.startTime}`
    );

    return dateB.getTime() - dateA.getTime();
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <EyebrowLabel>Termini</EyebrowLabel>
        <p>Učitavanje termina...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <EyebrowLabel>Termini</EyebrowLabel>

        <h1 className="font-display mt-3 text-4xl font-semibold">
          Upravljanje terminima
        </h1>

        <p className="text-muted mt-2">
          Odobri, odbij i prati sve zahteve za zakazivanje.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {APPT_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-medium px-4 py-2 rounded-full border transition ${
              tab === t
                ? "bg-primary text-white border-primary shadow-soft"
                : "bg-white border-[var(--border)] hover:border-primary hover:text-primary"
            }`}
          >
            {t === "All" ? "Svi" : mapAppointmentStatusToSr(t)}

            <span className="ml-2 text-[11px] opacity-80">
              {t === "All"
                ? appointments.length
                : appointments.filter((a) => a.status === t).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.6fr_1.2fr_0.8fr_1fr_auto] gap-4 px-6 py-3 text-[11px] uppercase tracking-[0.15em] text-muted bg-[var(--background-soft)]/50 border-b border-[var(--border)]">
          <span>Klijent i usluga</span>
          <span>Datum i vreme</span>
          <span>Cena</span>
          <span>Status</span>
          <span className="text-right">Akcije</span>
        </div>

        <ul className="divide-y divide-[var(--border)]">
          {filteredAppointments.length === 0 ? (
            <li className="px-6 py-10 text-center text-muted">
              Nema termina za izabrani filter.
            </li>
          ) : (
            filteredAppointments.map((a) => (
              <li
                key={a.id}
                className="px-4 md:px-6 py-4 grid grid-cols-1 md:grid-cols-[1.6fr_1.2fr_0.8fr_1fr_auto] gap-3 md:gap-4 items-center"
              >
                <div
                  onClick={() => setSelectedAppointment(a)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                >
                  <Avatar name={a.customerName || "Klijent"} size={40} />

                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {a.customerName || "Klijent"}
                    </p>

                    <p className="text-xs text-muted truncate">
                      {mapServiceTypeToSr(a.serviceType)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {formatDate(a.appointmentDate)}
                  </p>

                  <p className="text-xs text-muted">
                    {formatTime(a.startTime)} - {formatTime(a.endTime)}
                  </p>

                  {a.note && (
                    <p className="mt-1 text-[11px] text-muted truncate max-w-[180px]">
                      {a.note}
                    </p>
                  )}
                </div>

                <p className="font-display text-lg font-semibold text-primary">
                  {formatPrice(a.price)}
                </p>

                <StatusBadge status={a.status} />

                <div className="flex justify-end gap-2 flex-wrap">
                  {a.status === "Pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="!text-[#8a3948] !border-[#ecc0c8]"
                        onClick={() => handleReject(a.id)}
                      >
                        Odbij
                      </Button>

                      <Button size="sm" onClick={() => handleAccept(a.id)}>
                        Odobri
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      {selectedAppointment && (
  <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-softer border border-[var(--border)] w-full max-w-md p-6">
      <div className="flex items-center gap-3">
        <Avatar name={selectedAppointment.customerName || "Klijent"} size={48} />

        <div>
          <h2 className="font-display text-2xl font-semibold">
            {selectedAppointment.customerName}
          </h2>
          <p className="text-sm text-muted">
            {selectedAppointment.customerEmail || "Email nije unet"}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between border-b border-[var(--border)] pb-2">
          <span className="text-muted">Telefon</span>
          <span className="font-medium">
            {selectedAppointment.customerPhone || "Nije unet"}
          </span>
        </div>

        <div className="flex justify-between border-b border-[var(--border)] pb-2">
          <span className="text-muted">Usluga</span>
          <span className="font-medium">
            {mapServiceTypeToSr(selectedAppointment.serviceType)}
          </span>
        </div>

        <div className="flex justify-between border-b border-[var(--border)] pb-2">
          <span className="text-muted">Datum</span>
          <span className="font-medium">
            {formatDate(selectedAppointment.appointmentDate)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={() => setSelectedAppointment(null)}>
          Zatvori
        </Button>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("sr-RS");
}

function formatTime(time: string) {
  return time?.slice(0, 5);
}

function formatPrice(price?: number) {
  if (price == null) return "—";
  return `${price.toLocaleString("sr-RS")} RSD`;
}
