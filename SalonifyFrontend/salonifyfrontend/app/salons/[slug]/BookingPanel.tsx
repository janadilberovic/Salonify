"use client";

import { useMemo, useState } from "react";
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  SparkleIcon,
  ArrowRightIcon,
} from "../../components/Icons";
import {
  Button,
  Label,
  Textarea,
} from "../../components/ui";
import type { Service } from "../../lib/data";
import { BOOKED_SLOTS, TIME_SLOTS } from "../../lib/data";

function getNextDays(count: number) {
  const days: { key: string; day: string; date: string; dow: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate().toString(),
      dow: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return days;
}

export default function BookingPanel({
  services,
  currency = "€",
}: {
  services: Service[];
  currency?: string;
}) {
  const days = useMemo(() => getNextDays(10), []);
  const [selectedService, setSelectedService] = useState(services[0]?.id);
  const [selectedDay, setSelectedDay] = useState(days[0]?.key);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const service = services.find((s) => s.id === selectedService);

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-[var(--border)] shadow-soft p-8 text-center">
        <span className="inline-flex items-center justify-center size-16 rounded-full bg-success-soft text-[#2f6a51] mx-auto">
          <CheckIcon width={28} height={28} />
        </span>
        <h3 className="font-display text-2xl font-semibold mt-5">
          Request sent ✨
        </h3>
        <p className="mt-2 text-sm text-muted">
          The salon will confirm your appointment shortly. You&rsquo;ll get a
          notification the moment they do.
        </p>
        <div className="mt-6 p-4 rounded-2xl bg-primary-soft/50 text-sm">
          <p className="font-semibold">{service?.name}</p>
          <p className="text-muted mt-1">
            {days.find((d) => d.key === selectedDay)?.day} · {selectedTime} ·{" "}
            {currency}
            {service?.price}
          </p>
        </div>
        <Button
          variant="ghost"
          className="mt-6"
          onClick={() => setSubmitted(false)}
        >
          Book another
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] shadow-soft p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <SparkleIcon width={14} height={14} /> Book an appointment
          </span>
          <h3 className="font-display mt-2 text-2xl font-semibold">
            Reserve your time
          </h3>
        </div>
        <span className="text-xs text-muted bg-[var(--background-soft)] px-3 h-7 rounded-full inline-flex items-center">
          Instant confirm
        </span>
      </div>

      {/* Service */}
      <div>
        <Label>Service</Label>
        <div className="grid sm:grid-cols-2 gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedService(s.id)}
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
                {currency}
                {s.price}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <Label>
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon width={14} height={14} /> Pick a day
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

      {/* Time slots */}
      <div>
        <Label>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon width={14} height={14} /> Available times
          </span>
        </Label>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {TIME_SLOTS.map((t) => {
            const booked = BOOKED_SLOTS.has(t);
            const active = selectedTime === t;
            return (
              <button
                key={t}
                disabled={booked}
                onClick={() => setSelectedTime(t)}
                className={`h-10 rounded-xl text-sm font-medium transition border ${
                  booked
                    ? "bg-[var(--background-soft)] text-muted-soft border-transparent line-through"
                    : active
                    ? "bg-primary text-white border-primary shadow-soft"
                    : "bg-white text-foreground border-[var(--border)] hover:border-primary hover:text-primary"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div>
        <Label htmlFor="note">Note for the salon (optional)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any allergies, inspiration photos or preferences…"
        />
      </div>

      {/* Summary + CTA */}
      <div className="pt-5 border-t border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Service</span>
          <span className="font-medium">{service?.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Duration</span>
          <span className="font-medium">{service?.duration} min</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Total</span>
          <span className="font-display text-2xl font-semibold text-primary">
            {currency}
            {service?.price}
          </span>
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={!selectedTime}
          onClick={() => setSubmitted(true)}
        >
          {selectedTime ? "Request appointment" : "Pick a time to continue"}
          <ArrowRightIcon />
        </Button>

        <p className="text-xs text-muted text-center">
          No charge until the salon confirms your request.
        </p>
      </div>
    </div>
  );
}
