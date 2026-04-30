"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  SparkleIcon,
  ArrowRightIcon,
} from "../../components/Icons";
import { Button, Label, Textarea } from "../../components/ui";
import PrettyDatePicker from "../../components/PrettyDatePicker";
import type { AvailableSlot } from "@/types/appointments";
import {
  createAppointment,
  getAvailableAppointmentsByDate,
} from "@/services/appointment";
import { Service } from "@/app/lib/data";

function getNextDays(count: number) {
  const days: { key: string; day: string; date: string; dow: string }[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    days.push({
      key: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString("sr-Latn-RS", { weekday: "short" }),
      date: d.getDate().toString(),
      dow: d.toLocaleDateString("sr-Latn-RS", { month: "short" }),
    });
  }

  return days;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export const ServiceTypeMap: Record<string, number> = {
  Haircut: 0,
  Coloring: 1,
  Styling: 2,
  Manicure: 3,
  Pedicure: 4,
  Makeup: 5,
  Massage: 6,
  Facial: 7,
  Waxing: 8,
  SpaTreatment: 9,
  NailArt: 10,
  Other: 11,
};

function getServiceTypeNumber(service: Service) {
  if (typeof service.serviceType === "number") {
    return service.serviceType;
  }

  if (typeof service.serviceType === "string") {
    const parsed = Number(service.serviceType);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }

    return ServiceTypeMap[service.serviceType] ?? 11;
  }

  if (typeof service.id === "number") {
    return service.id;
  }

  if (typeof service.id === "string") {
    const parsed = Number(service.id);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }

    return ServiceTypeMap[service.id] ?? 11;
  }

  return 11;
}

export default function BookingPanel({
  salonId,
  services,
  currency = "RSD",
}: {
  salonId: string;
  services: Service[];
  currency?: string;
}) {
  const days = useMemo(() => getNextDays(10), []);
  const todayKey = useMemo(() => getTodayKey(), []);

  const [selectedService, setSelectedService] = useState(services[0]?.id);
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const service = services.find((s) => s.id === selectedService);

  const selectedSlot = availableSlots.find(
    (slot) => slot.startTime === selectedTime
  );

  const canBook = !!selectedSlot && selectedSlot.isAvailable && !bookingLoading;

  useEffect(() => {
    async function loadAvailableSlots() {
      if (!salonId || !selectedDay || !service) return;

      const serviceTypeNumber = getServiceTypeNumber(service);

      if (Number.isNaN(serviceTypeNumber)) {
        setAvailableSlots([]);
        setError("Tip usluge nije validan.");
        return;
      }

      try {
        setError("");
        setLoadingSlots(true);
        setSelectedTime(null);

        const slots = await getAvailableAppointmentsByDate(
          salonId,
          selectedDay,
          serviceTypeNumber
        );

        const normalizedSlots = slots.map((slot: any) => ({
          startTime: slot.startTime ?? slot.StartTime,
          endTime: slot.endTime ?? slot.EndTime,
          isAvailable: slot.isAvailable ?? slot.IsAvailable ?? false,
        }));

        setAvailableSlots(normalizedSlots);
      } catch (err: any) {
        setAvailableSlots([]);
        setError(err?.message || "Nije moguće učitati termine.");
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailableSlots();
  }, [salonId, selectedDay, service]);

  async function handleCreateAppointment() {
    if (!service || !selectedDay || !selectedTime || !selectedSlot) return;

    if (!selectedSlot.isAvailable) {
      setError("Izabrani termin nije dostupan.");
      return;
    }

    const serviceTypeNumber = getServiceTypeNumber(service);

    if (Number.isNaN(serviceTypeNumber)) {
      setError("Tip usluge nije validan.");
      return;
    }

    try {
      setError("");
      setBookingLoading(true);

      await createAppointment({
        salonId,
        serviceType: serviceTypeNumber,
        appointmentDate: selectedDay.slice(0,10),
        startTime: selectedTime,
        durationMinutes: service.duration,
        note,
      });

      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Zakazivanje nije uspelo.");
    } finally {
      setBookingLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-[var(--border)] shadow-soft p-8 text-center">
        <span className="inline-flex items-center justify-center size-16 rounded-full bg-success-soft text-[#2f6a51] mx-auto">
          <CheckIcon width={28} height={28} />
        </span>

        <h3 className="font-display text-2xl font-semibold mt-5">
          Zahtev je poslat ✨
        </h3>

        <p className="mt-2 text-sm text-muted">
          Salon će uskoro potvrditi tvoj termin. Dobićeš obaveštenje čim zahtev
          bude odobren.
        </p>

        <div className="mt-6 p-4 rounded-2xl bg-primary-soft/50 text-sm">
          <p className="font-semibold">{service?.name}</p>

          <p className="text-muted mt-1">
            {selectedDay} · {selectedTime?.slice(0, 5)} · {service?.price}{" "}
            {currency}
          </p>
        </div>

        <Button
          variant="ghost"
          className="mt-6"
          onClick={() => {
            setSubmitted(false);
            setSelectedTime(null);
            setNote("");
          }}
        >
          Zakaži još jedan termin
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] shadow-soft p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <SparkleIcon width={14} height={14} /> Zakaži termin
          </span>

          <h3 className="font-display mt-2 text-2xl font-semibold">
            Rezerviši svoje vreme
          </h3>
        </div>

        <span className="text-xs text-muted bg-[var(--background-soft)] px-3 h-7 rounded-full inline-flex items-center">
          Brz zahtev
        </span>
      </div>

      {/* USLUGA */}
      <div>
        <Label>Usluga</Label>

        <div className="grid sm:grid-cols-2 gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSelectedService(s.id);
                setSelectedTime(null);
              }}
              className={`text-left p-4 rounded-2xl border-2 transition ${
                selectedService === s.id
                  ? "border-primary bg-primary-soft/40"
                  : "border-[var(--border)] bg-white hover:border-primary/60"
              }`}
            >
              <p className="text-sm font-semibold">{s.name}</p>

              <p className="text-xs text-muted mt-0.5 truncate">
                {s.duration} min · {s.category}
              </p>

              <p className="text-sm font-semibold text-primary mt-2">
                {s.price} {currency}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* DATUM */}
<div>
  <Label>
    <span className="inline-flex items-center gap-1.5">
      <CalendarIcon width={14} height={14} /> Izaberi dan
    </span>
  </Label>

  <div className="rounded-3xl border border-[var(--border)] bg-[var(--background-soft)]/70 p-4">
    <div className="flex items-center justify-between gap-3 mb-3">
      <div>
        <p className="text-sm font-semibold text-foreground">
          Datum termina
        </p>
        <p className="text-xs text-muted">
          Izaberi jedan od predloženih dana ili unesi drugi datum.
        </p>
      </div>

      <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white px-3 h-8 text-xs font-medium text-primary border border-[var(--border)]">
        <CalendarIcon width={13} height={13} />
        {new Date(selectedDay).toLocaleDateString("sr-Latn-RS", {
          day: "2-digit",
          month: "short",
        })}
      </span>
    </div>

    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {days.map((d) => (
        <button
          key={d.key}
          type="button"
          onClick={() => {
            setSelectedDay(d.key);
            setSelectedTime(null);
          }}
          className={`shrink-0 rounded-2xl border-2 w-16 py-2.5 text-center transition ${
            selectedDay === d.key
              ? "border-primary bg-primary text-white shadow-soft"
              : "border-white bg-white hover:border-primary/60 hover:-translate-y-0.5"
          }`}
        >
          <p
            className={`text-[10px] uppercase tracking-[0.15em] ${
              selectedDay === d.key ? "text-white/80" : "text-muted"
            }`}
          >
            {d.day}
          </p>

          <p className="text-xl font-display font-semibold mt-0.5">
            {d.date}
          </p>

          <p
            className={`text-[10px] ${
              selectedDay === d.key ? "text-white/80" : "text-muted"
            }`}
          >
            {d.dow}
          </p>
        </button>
      ))}
    </div>

    <div className="mt-4 relative">
      <CalendarIcon
        width={16}
        height={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
      />

     <PrettyDatePicker
  value={selectedDay}
  onChange={(date) => {
    setSelectedDay(date);
    setSelectedTime(null);
  }}
/>
    </div>
  </div>
</div>

     

      {/* TERMINI */}
      <div>
        <Label>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon width={14} height={14} /> Termini
          </span>
        </Label>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {loadingSlots ? (
            <p className="col-span-full text-sm text-muted">
              Učitavanje termina...
            </p>
          ) : availableSlots.length === 0 ? (
            <p className="col-span-full text-sm text-muted">
              Nema termina za izabrani dan.
            </p>
          ) : (
            availableSlots.map((slot) => {
              const booked = slot.isAvailable === false;
              const active = selectedTime === slot.startTime;

              return (
                <button
                  key={`${slot.startTime}-${slot.endTime}`}
                  type="button"
                  disabled={booked}
                  onClick={() => {
                    if (booked) return;
                    setSelectedTime(slot.startTime);
                  }}
                  className={`h-10 rounded-xl text-sm font-medium transition border ${
                    booked
                      ? "bg-[var(--background-soft)] text-muted-soft border-transparent cursor-not-allowed"
                      : active
                      ? "bg-primary text-white border-primary shadow-soft"
                      : "bg-white text-foreground border-[var(--border)] hover:border-primary hover:text-primary"
                  }`}
                >
                  <span className={booked ? "line-through" : ""}>
                    {slot.startTime.slice(0, 5)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {availableSlots.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full border border-[var(--border)] bg-white" />
              Dostupno
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-[var(--background-soft)]" />
              Zauzeto
            </span>
          </div>
        )}
      </div>

      {/* NAPOMENA */}
      <div>
        <Label htmlFor="note">Napomena za salon opciono</Label>

        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Alergije, posebne želje, inspiracija, dodatna napomena..."
        />
      </div>

      {/* PREGLED + DUGME */}
      <div className="pt-5 border-t border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Usluga</span>
          <span className="font-medium">{service?.name}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Trajanje</span>
          <span className="font-medium">{service?.duration} min</span>
        </div>

        {selectedSlot && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Termin</span>
            <span className="font-medium">
              {selectedSlot.startTime.slice(0, 5)} -{" "}
              {selectedSlot.endTime.slice(0, 5)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Ukupno</span>
          <span className="font-display text-2xl font-semibold text-primary">
            {service?.price} {currency}
          </span>
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Button
          size="lg"
          className="w-full"
          disabled={!canBook}
          onClick={handleCreateAppointment}
        >
          {bookingLoading
            ? "Šalje se zahtev..."
            : selectedTime && selectedSlot?.isAvailable
            ? "Zakaži termin"
            : "Izaberi dostupan termin"}

          <ArrowRightIcon />
        </Button>

        <p className="text-xs text-muted text-center">
          Plaćanje se ne vrši dok salon ne potvrdi zahtev.
        </p>
      </div>
    </div>
  );
}