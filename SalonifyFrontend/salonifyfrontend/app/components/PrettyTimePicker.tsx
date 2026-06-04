"use client";

import { useMemo, useState } from "react";

type Props = {
  value: string;
  onChange: (time: string) => void;
};

function generateTimeSlots() {
  const slots: string[] = [];

  for (let hour = 8; hour <= 21; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 21 && minute === 30) continue;

      const h = String(hour).padStart(2, "0");
      const m = String(minute).padStart(2, "0");

      slots.push(`${h}:${m}`);
    }
  }

  return slots;
}

export default function PrettyTimePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const slots = useMemo(() => generateTimeSlots(), []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-3 text-sm font-medium text-foreground shadow-sm transition hover:border-primary hover:shadow-soft"
      >
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </span>

        <span className="truncate text-left text-base font-semibold">
          {value || "Izaberi vreme"}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-3 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-lift">
          <div className="border-b border-[var(--border)] bg-gradient-to-br from-white via-[#fdf7fb] to-primary-soft/50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Radno vreme
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
                  Izaberi vreme
                </h3>
              </div>

              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary"
                >
                  Obriši
                </button>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    onChange(slot);
                    setOpen(false);
                  }}
                  className={`h-11 rounded-2xl border text-sm font-semibold transition ${
                    value === slot
                      ? "border-primary bg-primary text-white shadow-soft"
                      : "border-[var(--border)] bg-[var(--background-soft)] text-foreground hover:border-primary hover:bg-white hover:text-primary"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
