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
  if (typeof service.category === "number") {
    return service.category;
  }

  if (typeof service.category === "string") {
    return ServiceTypeMap[service.category] ?? 11;
  }

  if (typeof service.category === "string") {
    return ServiceTypeMap[service.category] ?? 11;
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

  const [selectedService, setSelectedService] = useState(services[0]?.id);
  const [selectedDay, setSelectedDay] = useState(days[0]?.key);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const service = services.find((s) => s.id === selectedService);

  useEffect(() => {
    async function loadAvailableSlots() {
      if (!salonId || !selectedDay || !service) return;

      const serviceTypeNumber = getServiceTypeNumber(service);

      if (Number.isNaN(serviceTypeNumber)) {
        setAvailableSlots([]);
        setError("ServiceType nije validan broj.");
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
        console.log("dostupni",slots);
        setAvailableSlots(slots);
      } catch (err: any) {
        setAvailableSlots([]);
        setError(err?.message || "Nije moguće učitati slobodne termine.");
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailableSlots();
  }, [salonId, selectedDay, service]);

  async function handleCreateAppointment() {
    if (!service || !selectedDay || !selectedTime) return;

    const serviceTypeNumber = getServiceTypeNumber(service);

    if (Number.isNaN(serviceTypeNumber)) {
      setError("ServiceType nije validan broj.");
      return;
    }

    try {
      setError("");
      setBookingLoading(true);

      await createAppointment({
        salonId,
        serviceType: serviceTypeNumber,
        appointmentDate: selectedDay,
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
            {days.find((d) => d.key === selectedDay)?.day} ·{" "}
            {selectedTime?.slice(0, 5)} · {service?.price} {currency}
          </p>
        </div>

        <Button
          variant="ghost"
          className="mt-6"
          onClick={() => {
            setSubmitted(false);
            setSelectedTime(null);
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

      <div>
        <Label>Usluga</Label>

        <div className="grid sm:grid-cols-2 gap-2">
          {services.map((s) => (
            <button
              key={s.id}
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

      <div>
        <Label>
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon width={14} height={14} /> Izaberi dan
          </span>
        </Label>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {days.map((d) => (
            <button
              key={d.key}
              onClick={() => {
                setSelectedDay(d.key);
                setSelectedTime(null);
              }}
              className={`shrink-0 rounded-2xl border-2 w-16 py-2.5 text-center transition ${
                selectedDay === d.key
                  ? "border-primary bg-primary text-white"
                  : "border-[var(--border)] bg-white hover:border-primary/60"
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
      </div>

      <div>
        <Label>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon width={14} height={14} /> Slobodni termini
          </span>
        </Label>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {loadingSlots ? (
            <p className="col-span-full text-sm text-muted">
              Učitavanje slobodnih termina...
            </p>
          ) : availableSlots.length === 0 ? (
            <p className="col-span-full text-sm text-muted">
              Nema slobodnih termina za izabrani dan.
            </p>
          ) : (
            availableSlots.map((slot) => {
              const active = selectedTime === slot.startTime;

              return (
                <button
                  key={slot.startTime}
                  onClick={() => setSelectedTime(slot.startTime)}
                  className={`h-10 rounded-xl text-sm font-medium transition border ${
                    active
                      ? "bg-primary text-white border-primary shadow-soft"
                      : "bg-white text-foreground border-[var(--border)] hover:border-primary hover:text-primary"
                  }`}
                >
                  {slot.startTime.slice(0, 5)}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="note">Napomena za salon opciono</Label>

        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Alergije, posebne želje, inspiracija, dodatna napomena..."
        />
      </div>

      <div className="pt-5 border-t border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Usluga</span>
          <span className="font-medium">{service?.name}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Trajanje</span>
          <span className="font-medium">{service?.duration} min</span>
        </div>

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
          disabled={!selectedTime || bookingLoading}
          onClick={handleCreateAppointment}
        >
          {bookingLoading
            ? "Šalje se zahtev..."
            : selectedTime
            ? "Zakaži termin"
            : "Izaberi termin"}
          <ArrowRightIcon />
        </Button>

        <p className="text-xs text-muted text-center">
          Plaćanje se ne vrši dok salon ne potvrdi zahtev.
        </p>
      </div>
    </div>
  );
}